'use client';

import * as React from 'react';
import {
  IconCheck,
  IconMinus,
  IconPlus,
  IconTrash,
  IconX,
  IconZoomIn,
  IconZoomOut,
} from '@/components/icons';
import { NODE_STATE_LABELS } from '@/lib/constants';
import { clamp } from '@/lib/utils';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { PipelineEdge, PipelineNode } from '@/types';
import { ConnectionLine } from './ConnectionLine';
import { NODE_HEIGHT, NodeComponent, NODE_WIDTH } from './NodeComponent';
import { NODE_DRAG_MIME, parseNodeDragPayload } from './NodePalette';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 1.5;

interface PipelineCanvasProps {
  workflowId: string;
  nodes: readonly PipelineNode[];
  edges: readonly PipelineEdge[];
}

interface MenuState {
  nodeId: string;
  x: number;
  y: number;
}

export function PipelineCanvas({ workflowId, nodes: initialNodes, edges: initialEdges }: PipelineCanvasProps): React.ReactElement {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const viewport = useWorkflowStore((state) => state.viewport);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const pendingConnectionFrom = useWorkflowStore((state) => state.pendingConnectionFrom);
  const isRunning = useWorkflowStore((state) => state.isRunning);

  const setWorkflow = useWorkflowStore((state) => state.setWorkflow);
  const addNode = useWorkflowStore((state) => state.addNode);
  const moveNode = useWorkflowStore((state) => state.moveNode);
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const setViewport = useWorkflowStore((state) => state.setViewport);
  const beginConnection = useWorkflowStore((state) => state.beginConnection);
  const completeConnection = useWorkflowStore((state) => state.completeConnection);
  const cancelConnection = useWorkflowStore((state) => state.cancelConnection);
  const removeNode = useWorkflowStore((state) => state.removeNode);
  const removeEdge = useWorkflowStore((state) => state.removeEdge);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef(viewport);
  const dragRef = React.useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const panRef = React.useRef<{ startX: number; startY: number; vx: number; vy: number } | null>(null);
  const [cursorWorld, setCursorWorld] = React.useState<{ x: number; y: number } | null>(null);
  const [menu, setMenu] = React.useState<MenuState | null>(null);
  const workflowIdRef = React.useRef<string | null>(null);

  viewportRef.current = viewport;

  React.useEffect(() => {
    if (workflowIdRef.current === workflowId) {
      return;
    }
    workflowIdRef.current = workflowId;
    setWorkflow(
      initialNodes.map((node) => ({ ...node })),
      initialEdges.map((edge) => ({ ...edge }))
    );
  }, [workflowId, initialNodes, initialEdges, setWorkflow]);

  React.useEffect(() => {
    function onPointerMove(event: PointerEvent): void {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const worldX = (event.clientX - rect.left - viewportRef.current.x) / viewportRef.current.zoom;
        const worldY = (event.clientY - rect.top - viewportRef.current.y) / viewportRef.current.zoom;
        setCursorWorld({ x: worldX, y: worldY });
      }
      if (dragRef.current) {
        if (!rect) {
          return;
        }
        const x = (event.clientX - rect.left - viewportRef.current.x) / viewportRef.current.zoom - dragRef.current.offsetX;
        const y = (event.clientY - rect.top - viewportRef.current.y) / viewportRef.current.zoom - dragRef.current.offsetY;
        moveNode(dragRef.current.id, { x, y });
        return;
      }
      if (panRef.current) {
        setViewport({
          ...viewportRef.current,
          x: panRef.current.vx + (event.clientX - panRef.current.startX),
          y: panRef.current.vy + (event.clientY - panRef.current.startY),
        });
      }
    }
    function onPointerUp(): void {
      dragRef.current = null;
      panRef.current = null;
    }
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [moveNode, setViewport]);

  React.useEffect(() => {
    function onWheel(event: WheelEvent): void {
      event.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const factor = event.deltaY < 0 ? 1.1 : 0.9;
      const nextZoom = clamp(viewportRef.current.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      const worldX = (event.clientX - rect.left - viewportRef.current.x) / viewportRef.current.zoom;
      const worldY = (event.clientY - rect.top - viewportRef.current.y) / viewportRef.current.zoom;
      setViewport({
        x: event.clientX - rect.left - worldX * nextZoom,
        y: event.clientY - rect.top - worldY * nextZoom,
        zoom: nextZoom,
      });
    }
    const el = containerRef.current;
    if (!el) {
      return;
    }
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setViewport]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setMenu(null);
        cancelConnection();
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId && !isRunning) {
        event.preventDefault();
        removeNode(selectedNodeId);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedNodeId, isRunning, removeNode, cancelConnection]);

  function handleCanvasPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0 || event.target !== event.currentTarget) {
      return;
    }
    setMenu(null);
    if (!isRunning) {
      setSelectedNode(null);
      cancelConnection();
    }
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      vx: viewport.x,
      vy: viewport.y,
    };
  }

  function handleNodePointerDown(event: React.PointerEvent<HTMLDivElement>, node: PipelineNode): void {
    event.stopPropagation();
    setMenu(null);
    setSelectedNode(node.id);
    if (isRunning) {
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const worldX = (event.clientX - rect.left - viewport.x) / viewport.zoom;
    const worldY = (event.clientY - rect.top - viewport.y) / viewport.zoom;
    dragRef.current = { id: node.id, offsetX: worldX - node.position.x, offsetY: worldY - node.position.y };
  }

  function handleNodeClick(node: PipelineNode): void {
    setSelectedNode(node.id);
    if (pendingConnectionFrom) {
      completeConnection(node.id);
    }
  }

  function handleOutputClick(node: PipelineNode): void {
    if (isRunning || node.type === 'output' || node.type === 'error') {
      return;
    }
    if (pendingConnectionFrom === node.id) {
      cancelConnection();
      return;
    }
    beginConnection(node.id);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const payload = event.dataTransfer.getData(NODE_DRAG_MIME);
    const parsed = parseNodeDragPayload(payload);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!parsed || !rect) {
      return;
    }
    const worldX = (event.clientX - rect.left - viewport.x) / viewport.zoom - NODE_WIDTH / 2;
    const worldY = (event.clientY - rect.top - viewport.y) / viewport.zoom - NODE_HEIGHT / 2;
    addNode(parsed.kind, parsed.type, { x: worldX, y: worldY });
  }

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>, node: PipelineNode): void {
    event.preventDefault();
    if (isRunning) {
      return;
    }
    setSelectedNode(node.id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    setMenu({ nodeId: node.id, x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  function duplicateNode(nodeId: string): void {
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) {
      return;
    }
    addNode(node.kind, node.type, { x: node.position.x + 48, y: node.position.y + 48 });
    setMenu(null);
  }

  function disconnectNode(nodeId: string): void {
    const touching = edges.filter((edge) => edge.from === nodeId || edge.to === nodeId);
    for (const edge of touching) {
      removeEdge(edge.id);
    }
    setMenu(null);
  }

  function zoomTo(nextZoom: number): void {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const worldX = (centerX - viewport.x) / viewport.zoom;
    const worldY = (centerY - viewport.y) / viewport.zoom;
    setViewport({
      x: centerX - worldX * nextZoom,
      y: centerY - worldY * nextZoom,
      zoom: nextZoom,
    });
  }

  const pendingNode = pendingConnectionFrom ? nodes.find((node) => node.id === pendingConnectionFrom) : null;
  const selectedNode = selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) ?? null : null;

  return (
    <div
      ref={containerRef}
      className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle,_#2a2a40_1px,_transparent_1px)] [background-size:24px_24px]"
      onPointerDown={handleCanvasPointerDown}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={handleDrop}
      role="application"
      aria-label="Pipeline canvas"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`, transformOrigin: '0 0' }}
      >
        {edges.map((edge) => {
          const from = nodes.find((node) => node.id === edge.from);
          const to = nodes.find((node) => node.id === edge.to);
          if (!from || !to) {
            return null;
          }
          const start = {
            x: (from.position.x + NODE_WIDTH) * viewport.zoom,
            y: (from.position.y + NODE_HEIGHT / 2) * viewport.zoom,
          };
          const end = {
            x: to.position.x * viewport.zoom,
            y: (to.position.y + NODE_HEIGHT / 2) * viewport.zoom,
          };
          return (
            <ConnectionLine key={edge.id} start={start} end={end} />
          );
        })}

        {pendingNode && cursorWorld ? (
          <ConnectionLine
            interactive
            start={{
              x: (pendingNode.position.x + NODE_WIDTH) * viewport.zoom,
              y: (pendingNode.position.y + NODE_HEIGHT / 2) * viewport.zoom,
            }}
            end={{ x: cursorWorld.x * viewport.zoom, y: cursorWorld.y * viewport.zoom }}
          />
        ) : null}
      </div>

      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute"
          style={{ transform: `translate(${node.position.x * viewport.zoom + viewport.x}px, ${node.position.y * viewport.zoom + viewport.y}px) scale(${viewport.zoom})`, transformOrigin: '0 0' }}
        >
          <NodeComponent
            node={node}
            selected={selectedNodeId === node.id}
            onPointerDown={handleNodePointerDown}
            onClick={handleNodeClick}
            onOutputClick={handleOutputClick}
            onContextMenu={handleContextMenu}
          />
        </div>
      ))}

      {pendingConnectionFrom ? (
        <div className="pointer-events-none absolute right-4 top-4 rounded-md border border-brand-500/60 bg-dark-bg px-3 py-2 text-xs text-brand-300 shadow-card">
          Click a target node to connect — <span className="text-slate-500">Esc to cancel</span>
        </div>
      ) : null}

      {selectedNode ? (
        <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-dark-border bg-dark-bg px-3 py-2 text-xs text-slate-400 shadow-card">
          <span className="font-medium text-slate-200">{selectedNode.label}</span>
          <span className="mx-2 text-slate-600">·</span>
          {NODE_STATE_LABELS[selectedNode.state]}
          <span className="mx-2 text-slate-600">·</span>
          right-click for actions
        </div>
      ) : null}

      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-md border border-dark-border bg-dark-bg p-1 shadow-card">
        <button type="button" onClick={() => zoomTo(clamp(viewport.zoom * 1.2, MIN_ZOOM, MAX_ZOOM))} className="btn-ghost h-7 w-7 p-0" aria-label="Zoom in">
          <IconZoomIn size={14} />
        </button>
        <button type="button" onClick={() => zoomTo(clamp(viewport.zoom / 1.2, MIN_ZOOM, MAX_ZOOM))} className="btn-ghost h-7 w-7 p-0" aria-label="Zoom out">
          <IconZoomOut size={14} />
        </button>
        <button
          type="button"
          onClick={() => zoomTo(1)}
          className="w-12 text-center font-mono text-xs text-slate-400 hover:text-slate-200"
        >
          {Math.round(viewport.zoom * 100)}%
        </button>
      </div>

      {menu ? (
        <div
          className="absolute z-20 w-44 overflow-hidden rounded-lg border border-dark-border bg-dark-bg-elevated py-1 shadow-float"
          style={{ left: Math.min(menu.x, (containerRef.current?.clientWidth ?? 0) - 180), top: Math.min(menu.y, (containerRef.current?.clientHeight ?? 0) - 120) }}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => duplicateNode(menu.nodeId)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-dark-bg-secondary"
          >
            <IconPlus size={14} />
            Duplicate
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => disconnectNode(menu.nodeId)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-dark-bg-secondary"
          >
            <IconMinus size={14} />
            Disconnect
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              removeNode(menu.nodeId);
              setMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger-500 hover:bg-danger-500/10"
          >
            <IconTrash size={14} />
            Delete
          </button>
          <div className="mt-1 border-t border-dark-border" />
          <button
            type="button"
            role="menuitem"
            onClick={() => setMenu(null)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-500 hover:bg-dark-bg-secondary"
          >
            <IconX size={14} />
            Close
          </button>
        </div>
      ) : null}

      {isRunning ? (
        <div className="pointer-events-none absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full border border-brand-500/50 bg-dark-bg px-3 py-1 text-xs text-brand-300 shadow-card">
          <IconCheck size={12} className="animate-pulse" />
          Executing pipeline…
        </div>
      ) : null}
    </div>
  );
}
