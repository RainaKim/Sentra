import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeProps,
  useReactFlow,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getLayoutedElements } from './graphLayout';
import { getNodeStyle, normalizeNodeType } from './typeStyles';
import type {
  DecisionResponse,
  GraphPayloadNode,
} from '../../../api/types';

interface OntologyGraphProps {
  data: DecisionResponse | null;
  lang?: string;
}

// Predicate label mapping (Korean)
const PREDICATE_LABELS: Record<string, string> = {
  OWNS: '담당',
  REQUIRES_APPROVAL_BY: '승인 필요',
  GOVERNED_BY: '규정 적용',
  TRIGGERS: '리스크 유발',
  TRIGGERS_RULE: '규정 적용',
  HAS_GOAL: '목표',
  HAS_KPI: '측정 지표',
  HAS_COST: '비용',
  AFFECTS_REGION: '영향 범위',
  HAS_RISK: '위험 요소',
  EXCEEDS_THRESHOLD: '임계값 초과',
  SUPPORTS: '부합',
  CONFLICTS_WITH: '충돌',
  MEASURED_BY: '측정',
  GENERATES_RISK: '위험감지',
  ESCALATES_TO: '상위 승인 필요',
  USES_DATA: '데이터 사용',
};

// Predicate label mapping (English)
const PREDICATE_LABELS_EN: Record<string, string> = {
  OWNS: 'Owns',
  REQUIRES_APPROVAL_BY: 'Requires Approval',
  GOVERNED_BY: 'Governed By',
  TRIGGERS: 'Triggers Risk',
  TRIGGERS_RULE: 'Triggers Rule',
  HAS_GOAL: 'Goal',
  HAS_KPI: 'KPI',
  HAS_COST: 'Cost',
  AFFECTS_REGION: 'Affects',
  HAS_RISK: 'Has Risk',
  EXCEEDS_THRESHOLD: 'Exceeds Threshold',
  SUPPORTS: 'Supports',
  CONFLICTS_WITH: 'Conflicts With',
  MEASURED_BY: 'Measured By',
  GENERATES_RISK: 'Generates Risk',
  ESCALATES_TO: 'Escalates To',
  USES_DATA: 'Uses Data',
};

// Core predicates (shown by default)
const CORE_PREDICATES = new Set([
  'HAS_GOAL',
  'HAS_COST',
  'HAS_KPI',
  'AFFECTS_REGION',
  'TRIGGERS',
  'HAS_RISK',
  'EXCEEDS_THRESHOLD',
  'REQUIRES_APPROVAL_BY',
  'SUPPORTS',
  'CONFLICTS_WITH',
]);

// Get predicate label
function getPredicateLabel(predicate: string, lang?: string): string {
  if (lang === 'en') return PREDICATE_LABELS_EN[predicate] || predicate;
  return PREDICATE_LABELS[predicate] || predicate;
}

// Custom circular node component
function CircleNode({ data, selected }: NodeProps) {
  const style = getNodeStyle(data.type);
  const isHighlighted = data.highlighted ?? false;
  const isDimmed = data.dimmed ?? false;
  const isDecision = data.type === 'DECISION';
  const isConflict = data.isConflict ?? false;

  const bgColor = isConflict ? '#FFFBEB' : style.color;
  const borderColor = isConflict ? '#F59E0B' : style.borderColor;
  const textColor = isConflict ? '#92400E' : style.textColor;

  // Decision nodes are larger
  const nodeSize = isDecision ? 280 : 240;
  const fontSize = isDecision ? 13 : 12;
  const typeLabelSize = isDecision ? 10 : 9;

  return (
    <>
      {/* Connection handles - invisible but functional */}
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      <div
        style={{
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          borderRadius: '50%',
          backgroundColor: bgColor,
          border: `${isDecision ? 4 : 3}px solid ${borderColor}`,
          boxShadow: selected
            ? '0 6px 16px rgba(0, 0, 0, 0.2)'
            : isHighlighted
            ? '0 6px 16px rgba(0, 0, 0, 0.15)'
            : '0 3px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '36px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: isDimmed ? 0.3 : 1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontSize: `${typeLabelSize}px`,
            fontWeight: 600,
            color: textColor,
            opacity: 0.7,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {data.lang === 'en' ? (style.label_en || style.label) : style.label}
        </div>
        <div
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 600,
            color: textColor,
            textAlign: 'center',
            lineHeight: '1.4',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={data.fullLabel || data.label}
        >
          {data.label}
        </div>
      </div>
    </>
  );
}

const nodeTypes = {
  circle: CircleNode,
};

// No custom edge types needed - using built-in smoothstep

// Shorten label if too long
function shortenLabel(label: string, maxLength = 24): string {
  if (!label) return '';
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 1) + '…';
}

// Returns true if the string contains Korean characters
function hasKorean(str: string | null | undefined): boolean {
  if (!str) return false;
  return /[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(str);
}

// Return an English-safe label candidate, or null if the string is Korean
function enSafe(str: string | null | undefined): string | null {
  if (!str || hasKorean(str)) return null;
  return str;
}

// Clean label by removing type-specific prefixes
function cleanLabel(label: string, nodeType: string): string {
  if (!label) return '';

  // Remove "rule_XXX: " prefix from RULE nodes
  if (nodeType === 'RULE') {
    return label.replace(/^rule_\w+:\s*/i, '');
  }

  // Remove "K数字: " prefix from KPI nodes
  if (nodeType === 'KPI') {
    return label.replace(/^K\d+:\s*/i, '');
  }

  return label;
}

export function OntologyGraph({ data, lang }: OntologyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [coreEdgesOnly, setCoreEdgesOnly] = useState(false);
  const { fitView } = useReactFlow();

  // Parse graph from graph_payload.nodes and graph_payload.edges ONLY
  const { parsedNodes, parsedEdges } = useMemo(() => {
    const isEn = lang === 'en';
    if (!data?.graph_payload) {
      return { parsedNodes: [], parsedEdges: [] };
    }

    const graphPayload = data.graph_payload;

    // Check if nodes/edges are arrays (not numbers)
    if (!Array.isArray(graphPayload.nodes) || !Array.isArray(graphPayload.edges)) {
      console.warn('[OntologyGraph] graph_payload.nodes or edges is not an array');
      return { parsedNodes: [], parsedEdges: [] };
    }

    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    // Convert backend nodes to React Flow nodes
    graphPayload.nodes.forEach((node: GraphPayloadNode) => {
      const normalizedType = normalizeNodeType(node.type);
      const rawLabel = isEn
        ? (
            enSafe(node.label_en) ||
            enSafe(node.properties?.label_en as string) ||
            enSafe(node.properties?.name_en as string) ||
            enSafe(node.properties?.role_en as string) ||
            // KPI fallback: target value (e.g. "20%", "$1M") is usually ASCII
            (normalizedType === 'KPI' ? enSafe(String(node.properties?.target ?? '')) || enSafe(node.properties?.metric as string) : null) ||
            node.label ||
            node.id
          )
        : (node.label || node.id);
      const cleanedLabel = cleanLabel(rawLabel, normalizedType);

      rfNodes.push({
        id: node.id,
        type: 'circle',
        position: { x: 0, y: 0 }, // Will be set by dagre layout
        data: {
          label: cleanedLabel,
          fullLabel: cleanedLabel,
          type: normalizedType,
          lang,
          properties: node.properties,
          highlighted: false,
          dimmed: false,
        },
      });
    });

    // Collect target node IDs of CONFLICTS_WITH edges
    const conflictTargetIds = new Set<string>();
    graphPayload.edges.forEach((edge: any) => {
      const predicate = edge.predicate || edge.relation || '';
      if (predicate === 'CONFLICTS_WITH') {
        const target = edge.target || edge.to;
        if (target) conflictTargetIds.add(target);
      }
    });

    // Mark conflict target nodes
    rfNodes.forEach((n) => {
      if (conflictTargetIds.has(n.id)) {
        n.data.isConflict = true;
      }
    });

    // Convert backend edges to React Flow edges
    graphPayload.edges.forEach((edge: any, idx: number) => {
      const source = edge.source || edge.from;
      const target = edge.target || edge.to;
      const predicate = edge.predicate || edge.relation || '';

      if (!source || !target) {
        console.warn('[OntologyGraph] Edge missing source or target:', edge);
        return;
      }

      const predicateLabel = getPredicateLabel(predicate, lang);

      // Check if edge is risk-related
      const targetNode = graphPayload.nodes.find((n: any) => n.id === target);
      const normalizedTargetType = normalizeNodeType(targetNode?.type);
      const isRiskEdge = predicate === 'TRIGGERS' || predicate === 'GENERATES_RISK' || normalizedTargetType === 'GENERATES_RISK' || normalizedTargetType === 'RISK';
      const isConflictEdge = predicate === 'CONFLICTS_WITH';

      // Set colors based on edge type
      let edgeColor = '#6B7280'; // Default gray
      let labelColor = '#374151'; // Default dark gray

      if (isRiskEdge) {
        edgeColor = '#EF4444'; // Red
        labelColor = '#991B1B'; // Dark red
      } else if (isConflictEdge) {
        edgeColor = '#F59E0B'; // Amber/Yellow
        labelColor = '#92400E'; // Dark amber
      }

      rfEdges.push({
        id: `${source}-${predicate}-${target}-${idx}`,
        source,
        target,
        label: predicateLabel,
        labelStyle: { fill: labelColor, fontSize: 16, fontWeight: 600 },
        labelBgStyle: { fill: '#FFFFFF', fillOpacity: 1 },
        labelBgPadding: [10, 12] as [number, number],
        labelBgBorderRadius: 6,
        style: { stroke: edgeColor, strokeWidth: 4 },
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor, width: 30, height: 30 },
        data: {
          predicate,
          isCore: CORE_PREDICATES.has(predicate),
          edgeColor, // Store for use in node click handler
        },
      });
    });

    console.log('[OntologyGraph] Parsed nodes:', rfNodes.length);
    console.log('[OntologyGraph] Parsed edges:', rfEdges.length);

    return { parsedNodes: rfNodes, parsedEdges: rfEdges };
  }, [data, lang]);

  // Apply edge filter
  const filteredEdges = useMemo(() => {
    if (!coreEdgesOnly) return parsedEdges;
    return parsedEdges.filter(edge => edge.data?.isCore);
  }, [parsedEdges, coreEdgesOnly]);

  // Apply layout when data changes
  useEffect(() => {
    if (parsedNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    console.log('[OntologyGraph] Applying layout to', parsedNodes.length, 'nodes and', filteredEdges.length, 'edges');

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      parsedNodes,
      filteredEdges,
      {
        direction: 'LR',
        nodeWidth: 280,
        nodeHeight: 280,
        rankSep: 250,
        nodeSep: 220,
      }
    );

    console.log('[OntologyGraph] After layout:', layoutedNodes.length, 'nodes,', layoutedEdges.length, 'edges');

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Fit view after a short delay to ensure layout is applied
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, [parsedNodes, filteredEdges, setNodes, setEdges, fitView]);

  // Handle node click - highlight neighbors
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (selectedNode === node.id) {
        // Deselect - remove all highlights
        setSelectedNode(null);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, highlighted: false, dimmed: false },
          }))
        );
        setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            style: { ...e.style, opacity: 1, stroke: e.data?.edgeColor || '#6B7280' },
            animated: false,
          }))
        );
      } else {
        // Select - highlight neighbors
        setSelectedNode(node.id);

        // Find connected nodes
        const connectedNodeIds = new Set<string>([node.id]);
        const connectedEdgeIds = new Set<string>();

        edges.forEach((edge) => {
          if (edge.source === node.id || edge.target === node.id) {
            connectedNodeIds.add(edge.source);
            connectedNodeIds.add(edge.target);
            connectedEdgeIds.add(edge.id);
          }
        });

        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: {
              ...n.data,
              highlighted: n.id === node.id,
              dimmed: !connectedNodeIds.has(n.id),
            },
          }))
        );

        setEdges((eds) =>
          eds.map((e) => {
            const isConnected = connectedEdgeIds.has(e.id);
            const originalColor = e.data?.edgeColor || '#6B7280';
            return {
              ...e,
              style: {
                ...e.style,
                opacity: isConnected ? 1 : 0.2,
                stroke: isConnected ? originalColor : '#D1D5DB',
              },
              animated: isConnected,
            };
          })
        );
      }
    },
    [selectedNode, edges, setNodes, setEdges]
  );

  // Empty / partial states
  if (!data?.graph_payload) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '14px',
          gap: '12px',
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        <div>{lang === 'en' ? 'Generating graph…' : '그래프 생성 중…'}</div>
      </div>
    );
  }

  if (parsedNodes.length === 0 && parsedEdges.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '14px',
        }}
      >
        관계 데이터가 아직 없습니다
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'straight',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6B7280', width: 30, height: 30 },
          style: { stroke: '#6B7280', strokeWidth: 4 },
        }}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#E5E7EB" />
        <Controls
          style={{
            button: {
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
            },
          }}
        />
      </ReactFlow>
    </div>
  );
}
