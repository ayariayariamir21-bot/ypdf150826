import { create } from 'zustand';
import type {
  ExecutionLogEntry,
  NodeKindId,
  NodeState,
  NodeTypeId,
  PipelineEdge,
  PipelineNode,
  PipelineNodeConfig,
  ValidationIssue,
} from '@/types';
import { NODE_DESCRIPTIONS, NODE_LABELS } from '@/lib/constants';
import { uid } from '@/lib/utils';

export interface Point {
  x: number;
  y: number;
}

interface RunDriver {
  order: readonly string[];
  index: number;
  cancelled: boolean;
  paused: boolean;
}

let driver: RunDriver | null = null;

function buildRunOrder(nodes: readonly PipelineNode[], edges: readonly PipelineEdge[]): string[] {
  const outgoing = new Map<string, string[]>();
  for (const edge of edges) {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge.to);
    outgoing.set(edge.from, list);
  }
  const order: string[] = [];
  const visited = new Set<string>();
  const queue: string[] = nodes.filter((node) => node.type === 'trigger').map((node) => node.id);
  let cursor = 0;
  while (cursor < queue.length) {
    const id = queue[cursor];
    cursor += 1;
    if (!id || visited.has(id)) {
      continue;
    }
    visited.add(id);
    order.push(id);
    for (const next of outgoing.get(id) ?? []) {
      if (!visited.has(next)) {
        queue.push(next);
      }
    }
  }
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      order.push(node.id);
    }
  }
  return order;
}

interface WorkflowState {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  selectedNodeId: string | null;
  pendingConnectionFrom: string | null;
  viewport: Point & { zoom: number };
  isRunning: boolean;
  isPaused: boolean;
  isDirty: boolean;
  isSaving: boolean;
  log: ExecutionLogEntry[];
  validationIssues: ValidationIssue[];

  setWorkflow: (nodes: PipelineNode[], edges: PipelineEdge[]) => void;
  addNode: (kind: NodeKindId, type: NodeTypeId, position: Point) => void;
  moveNode: (id: string, position: Point) => void;
  updateNodeState: (id: string, state: NodeState) => void;
  updateNodeConfig: (id: string, config: Partial<PipelineNodeConfig>) => void;
  removeNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  beginConnection: (from: string) => void;
  completeConnection: (to: string) => void;
  cancelConnection: () => void;
  removeEdge: (id: string) => void;
  setViewport: (viewport: Point & { zoom: number }) => void;
  run: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  validate: () => void;
  setSaving: (saving: boolean) => void;
  markSaved: () => void;
  addLog: (level: ExecutionLogEntry['level'], message: string) => void;
  clearLog: () => void;
}

export const useWorkflowStore = create<WorkflowState>()((set, get) => {
  function step(): void {
    const current = driver;
    if (!current || current.cancelled) {
      return;
    }
    const nodeId = current.order[current.index];
    if (!nodeId) {
      set({ isRunning: false, isPaused: false });
      driver = null;
      get().addLog('success', 'Run completed successfully');
      return;
    }
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, state: 'running' } : node)),
    }));
    window.setTimeout(() => {
      const active = driver;
      if (!active || active.cancelled || active !== current || active.paused) {
        return;
      }
      const node = get().nodes.find((item) => item.id === nodeId);
      const shouldFail = node != null && node.type !== 'trigger' && Math.random() < 0.07;
      if (shouldFail) {
        set((state) => ({
          nodes: state.nodes.map((item) =>
            item.id === nodeId ? { ...item, state: 'failed' } : item
          ),
          isRunning: false,
          isPaused: false,
        }));
        active.cancelled = true;
        driver = null;
        const label = node ? node.label : nodeId;
        get().addLog('error', `${label} failed — the run has stopped`);
        return;
      }
      set((state) => ({
        nodes: state.nodes.map((item) =>
          item.id === nodeId ? { ...item, state: 'completed' } : item
        ),
      }));
      const completed = get().nodes.find((item) => item.id === nodeId);
      if (completed) {
        get().addLog('info', `${completed.label} completed`);
      }
      active.index += 1;
      step();
    }, 700);
  }

  return {
    nodes: [],
    edges: [],
    selectedNodeId: null,
    pendingConnectionFrom: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    isRunning: false,
    isPaused: false,
    isDirty: false,
    isSaving: false,
    log: [],
    validationIssues: [],

    setWorkflow: (nodes, edges) =>
      set({
        nodes: nodes.map((node) => ({ ...node, position: { ...node.position } })),
        edges: edges.map((edge) => ({ ...edge })),
        selectedNodeId: null,
        pendingConnectionFrom: null,
        isRunning: false,
        isPaused: false,
        log: [],
        validationIssues: [],
      }),

    addNode: (kind, type, position) => {
      const node: PipelineNode = {
        id: uid('node'),
        kind,
        type,
        label: NODE_LABELS[kind],
        description: NODE_DESCRIPTIONS[kind],
        position: { ...position },
        state: 'idle',
        config: {},
      };
      set((state) => ({ nodes: [...state.nodes, node], selectedNodeId: node.id, isDirty: true }));
      get().addLog('info', `Added "${node.label}" node`);
    },

    moveNode: (id, position) => {
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, position: { ...position } } : node
        ),
        isDirty: true,
      }));
    },

    updateNodeState: (id, nodeState) => {
      set((state) => ({
        nodes: state.nodes.map((node) => (node.id === id ? { ...node, state: nodeState } : node)),
      }));
    },

  updateNodeConfig: (id, config: Partial<PipelineNodeConfig>) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== id) {
          return node;
        }
        const merged: PipelineNodeConfig = { ...node.config };
        for (const [key, value] of Object.entries(config)) {
          if (value !== undefined) {
            merged[key] = value;
          }
        }
        return { ...node, config: merged };
      }),
      isDirty: true,
    }));
  },

    removeNode: (id) => {
      const node = get().nodes.find((item) => item.id === id);
      set((state) => {
        return {
          nodes: state.nodes.filter((item) => item.id !== id),
          edges: state.edges.filter((edge) => edge.from !== id && edge.to !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          pendingConnectionFrom:
            state.pendingConnectionFrom === id ? null : state.pendingConnectionFrom,
          isDirty: true,
        };
      });
      if (node) {
        get().addLog('warning', `Removed "${node.label}" node`);
      }
    },

    setSelectedNode: (id) => set({ selectedNodeId: id }),

    beginConnection: (from) => {
      if (get().isRunning) {
        return;
      }
      set({ pendingConnectionFrom: from });
    },

    completeConnection: (to) => {
      const from = get().pendingConnectionFrom;
      if (!from || from === to) {
        set({ pendingConnectionFrom: null });
        return;
      }
      const state = get();
      const fromNode = state.nodes.find((node) => node.id === from);
      const toNode = state.nodes.find((node) => node.id === to);
      if (!fromNode || !toNode) {
        set({ pendingConnectionFrom: null });
        return;
      }
      if (fromNode.type === 'output' || toNode.type === 'trigger') {
        get().addLog('warning', 'Invalid connection between these nodes');
        set({ pendingConnectionFrom: null });
        return;
      }
      const alreadyConnected = state.edges.some(
        (edge) => edge.from === from && edge.to === to
      );
      if (alreadyConnected) {
        set({ pendingConnectionFrom: null });
        return;
      }
      const edge: PipelineEdge = { id: uid('edge'), from, to };
      set((current) => ({
        edges: [...current.edges, edge],
        pendingConnectionFrom: null,
        isDirty: true,
      }));
      get().addLog('info', `Connected "${fromNode.label}" → "${toNode.label}"`);
    },

    cancelConnection: () => set({ pendingConnectionFrom: null }),

    removeEdge: (id) => {
      set((state) => ({ edges: state.edges.filter((edge) => edge.id !== id), isDirty: true }));
    },

    setViewport: (viewport) => set({ viewport: { ...viewport } }),

    run: () => {
      const state = get();
      if (state.isRunning) {
        return;
      }
      driver = {
        order: buildRunOrder(state.nodes, state.edges),
        index: 0,
        cancelled: false,
        paused: false,
      };
      set((current) => ({
        isRunning: true,
        isPaused: false,
        selectedNodeId: null,
        pendingConnectionFrom: null,
        nodes: current.nodes.map((node) => ({ ...node, state: 'idle' as NodeState })),
        validationIssues: [],
      }));
      get().addLog('info', 'Run started');
      step();
    },

    pause: () => {
      if (!get().isRunning || get().isPaused) {
        return;
      }
      if (driver) {
        driver.paused = true;
      }
      set((state) => ({
        isPaused: true,
        nodes: state.nodes.map((node) =>
          node.state === 'running' ? { ...node, state: 'paused' as NodeState } : node
        ),
      }));
      get().addLog('warning', 'Run paused');
    },

    resume: () => {
      if (!get().isRunning || !get().isPaused) {
        return;
      }
      if (driver) {
        driver.paused = false;
      }
      set({ isPaused: false });
      get().addLog('info', 'Run resumed');
      step();
    },

    stop: () => {
      if (driver) {
        driver.cancelled = true;
      }
      driver = null;
      set((state) => ({
        isRunning: false,
        isPaused: false,
        nodes: state.nodes.map((node) =>
          node.state === 'running' || node.state === 'paused'
            ? { ...node, state: 'idle' as NodeState }
            : node
        ),
      }));
      get().addLog('warning', 'Run stopped by user');
    },

    validate: () => {
      const { nodes, edges } = get();
      const issues: ValidationIssue[] = [];
      const nodesById = new Map(nodes.map((node) => [node.id, node]));
      const incoming = new Map<string, number>();
      for (const edge of edges) {
        incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
      }
      for (const node of nodes) {
        if (node.type === 'trigger' && (incoming.get(node.id) ?? 0) > 0) {
          issues.push({
            nodeId: node.id,
            message: 'Trigger nodes cannot have incoming connections.',
          });
        }
      }
      for (const edge of edges) {
        if (!nodesById.has(edge.from) || !nodesById.has(edge.to)) {
          issues.push({ nodeId: edge.from, message: 'Connection references a missing node.' });
        }
      }
      const connected = new Set<string>();
      for (const edge of edges) {
        connected.add(edge.from);
        connected.add(edge.to);
      }
      for (const node of nodes) {
        if (node.type === 'output' && !connected.has(node.id)) {
          issues.push({ nodeId: node.id, message: 'Output node is not connected to the graph.' });
        }
      }
      set({ validationIssues: issues });
      if (issues.length === 0) {
        get().addLog('success', 'Workflow is valid');
      } else {
        for (const issue of issues) {
          get().addLog('error', issue.message);
        }
      }
    },

    setSaving: (saving) => set({ isSaving: saving }),

    markSaved: () => set({ isDirty: false }),

    addLog: (level, message) => {
      const entry: ExecutionLogEntry = {
        id: uid('log'),
        timestamp: new Date().toISOString(),
        level,
        message,
      };
      set((state) => ({ log: [...state.log.slice(-99), entry] }));
    },

    clearLog: () => set({ log: [] }),
  };
});
