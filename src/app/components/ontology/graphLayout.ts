import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';

export interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
}

const defaultOptions: Required<LayoutOptions> = {
  direction: 'LR',
  nodeWidth: 190,
  nodeHeight: 80,
  rankSep: 120,
  nodeSep: 40,
};

/**
 * Apply dagre layout to React Flow nodes.
 * Returns positioned nodes with deterministic layout.
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const opts = { ...defaultOptions, ...options };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  });

  nodes.forEach((node) => {
    const isDecision = node.data?.type === 'DECISION';
    const nodeWidth = isDecision ? 240 : opts.nodeWidth;
    const nodeHeight = isDecision ? 90 : opts.nodeHeight;

    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isDecision = node.data?.type === 'DECISION';
    const nodeWidth = isDecision ? 240 : opts.nodeWidth;
    const nodeHeight = isDecision ? 90 : opts.nodeHeight;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
