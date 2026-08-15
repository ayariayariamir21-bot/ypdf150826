import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { PipelineNode } from '@/types';

function makeNode(
  id: string,
  type: PipelineNode['type'],
  kind: PipelineNode['kind'],
  label = type
): PipelineNode {
  return { id, type, kind, label, description: '', position: { x: 0, y: 0 }, state: 'idle', config: {} };
}

const initial = {
  nodes: [] as PipelineNode[],
  edges: [] as Array<{ id: string; from: string; to: string }>,
  selectedNodeId: null as string | null,
  pendingConnectionFrom: null as string | null,
  viewport: { x: 0, y: 0, zoom: 1 },
  isRunning: false,
  isPaused: false,
  isDirty: false,
  isSaving: false,
};

beforeEach(() => {
  useWorkflowStore.setState({ ...initial, log: [], validationIssues: [] });
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('workflowStore graph editing', () => {
  it('adds nodes with labels and selects them', () => {
    const store = useWorkflowStore;
    store.getState().addNode('ocr', 'activity', { x: 10, y: 20 });
    const state = store.getState();
    expect(state.nodes).toHaveLength(1);
    expect(state.nodes[0]?.kind).toBe('ocr');
    expect(state.nodes[0]?.position).toEqual({ x: 10, y: 20 });
    expect(state.nodes[0]?.state).toBe('idle');
    expect(state.selectedNodeId).toBe(state.nodes[0]?.id ?? null);
    expect(state.isDirty).toBe(true);
  });

  it('moves nodes and merges config patches', () => {
    const store = useWorkflowStore;
    store.getState().addNode('condition', 'gate', { x: 0, y: 0 });
    const node = store.getState().nodes[0];
    if (!node) {
      throw new Error('expected node');
    }
    store.getState().moveNode(node.id, { x: 40, y: 50 });
    expect(store.getState().nodes[0]?.position).toEqual({ x: 40, y: 50 });

    store.getState().updateNodeConfig(node.id, { threshold: 5 });
    store.getState().updateNodeConfig(node.id, { threshold: undefined, model: 'gpt-4o' });
    expect(store.getState().nodes[0]?.config).toEqual({ threshold: 5, model: 'gpt-4o' });
  });

  it('removes a node and its edges', () => {
    const store = useWorkflowStore;
    const trigger = makeNode('t', 'trigger', 'schedule');
    const output = makeNode('o', 'output', 'archive');
    store.getState().setWorkflow([trigger, output], [{ id: 'e1', from: 't', to: 'o' }]);
    store.getState().removeNode('t');
    const state = store.getState();
    expect(state.nodes.map((item) => item.id)).toEqual(['o']);
    expect(state.edges).toHaveLength(0);
  });

  it('connects valid nodes and rejects invalid ones', () => {
    const store = useWorkflowStore;
    const trigger = makeNode('t', 'trigger', 'schedule');
    const activity = makeNode('a', 'activity', 'ocr');
    const output = makeNode('o', 'output', 'archive');
    store.getState().setWorkflow([trigger, activity, output], []);

    store.getState().beginConnection('t');
    store.getState().completeConnection('a');
    expect(store.getState().edges).toHaveLength(1);

    store.getState().beginConnection('a');
    store.getState().completeConnection('t');
    expect(store.getState().edges).toHaveLength(1);

    store.getState().beginConnection('o');
    store.getState().completeConnection('a');
    expect(store.getState().edges).toHaveLength(1);

    store.getState().beginConnection('a');
    store.getState().completeConnection('a');
    expect(store.getState().edges).toHaveLength(1);

    store.getState().cancelConnection();
    expect(store.getState().pendingConnectionFrom).toBeNull();
  });
});

describe('workflowStore validation', () => {
  it('flags triggers with incoming edges and orphan outputs', () => {
    const store = useWorkflowStore;
    const trigger = makeNode('t', 'trigger', 'schedule');
    const activity = makeNode('a', 'activity', 'ocr');
    const output = makeNode('o', 'output', 'archive');
    store
      .getState()
      .setWorkflow([trigger, activity, output], [{ id: 'e1', from: 'a', to: 't' }]);
    store.getState().validate();
    const issues = store.getState().validationIssues;
    expect(issues.some((issue) => issue.nodeId === 't')).toBe(true);
    expect(issues.some((issue) => issue.nodeId === 'o')).toBe(true);
  });

  it('passes a valid graph', () => {
    const store = useWorkflowStore;
    const trigger = makeNode('t', 'trigger', 'schedule');
    const output = makeNode('o', 'output', 'archive');
    store.getState().setWorkflow([trigger, output], [{ id: 'e1', from: 't', to: 'o' }]);
    store.getState().validate();
    expect(store.getState().validationIssues).toHaveLength(0);
  });
});

describe('workflowStore run simulation', () => {
  it('walks the graph in order and completes', () => {
    vi.useFakeTimers();
    const store = useWorkflowStore;
    const trigger = makeNode('t', 'trigger', 'schedule');
    const activity = makeNode('a', 'activity', 'ocr');
    const output = makeNode('o', 'output', 'archive');
    store
      .getState()
      .setWorkflow(
        [trigger, activity, output],
        [
          { id: 'e1', from: 't', to: 'a' },
          { id: 'e2', from: 'a', to: 'o' },
        ]
      );
    store.getState().run();
    expect(store.getState().isRunning).toBe(true);

    vi.advanceTimersByTime(700);
    expect(store.getState().nodes.find((node) => node.id === 't')?.state).toBe('completed');

    vi.advanceTimersByTime(700);
    expect(store.getState().nodes.find((node) => node.id === 'a')?.state).toBe('completed');

    vi.advanceTimersByTime(700);
    expect(store.getState().nodes.find((node) => node.id === 'o')?.state).toBe('completed');
    expect(store.getState().isRunning).toBe(false);
    expect(store.getState().log.some((entry) => entry.message.includes('completed'))).toBe(true);
  });

  it('pauses, resumes and stops a run', () => {
    vi.useFakeTimers();
    const store = useWorkflowStore;
    const trigger = makeNode('t', 'trigger', 'schedule');
    const output = makeNode('o', 'output', 'archive');
    store.getState().setWorkflow([trigger, output], [{ id: 'e1', from: 't', to: 'o' }]);

    store.getState().run();
    vi.advanceTimersByTime(700);
    store.getState().pause();
    expect(store.getState().isPaused).toBe(true);
    const before = store.getState().nodes.find((node) => node.id === 'o');
    expect(before?.state).toBe('paused');

    vi.advanceTimersByTime(5000);
    expect(store.getState().nodes.find((node) => node.id === 'o')?.state).toBe('paused');

    store.getState().resume();
    vi.advanceTimersByTime(700);
    expect(store.getState().nodes.find((node) => node.id === 'o')?.state).toBe('completed');
  });

  it('stops a run and resets running nodes', () => {
    vi.useFakeTimers();
    const store = useWorkflowStore;
    const trigger = makeNode('t', 'trigger', 'schedule');
    const output = makeNode('o', 'output', 'archive');
    store.getState().setWorkflow([trigger, output], [{ id: 'e1', from: 't', to: 'o' }]);
    store.getState().run();
    vi.advanceTimersByTime(700);
    store.getState().stop();
    expect(store.getState().isRunning).toBe(false);
    expect(store.getState().isPaused).toBe(false);
    vi.advanceTimersByTime(5000);
    const outputNode = store.getState().nodes.find((node) => node.id === 'o');
    expect(outputNode?.state).toBe('idle');
  });
});
