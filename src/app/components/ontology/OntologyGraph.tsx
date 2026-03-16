import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  useNodesState,
  useEdgesState,
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
  conflicts?: string[];
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

function getPredicateLabel(predicate: string, lang?: string): string {
  if (lang === 'en') return PREDICATE_LABELS_EN[predicate] || predicate;
  return PREDICATE_LABELS[predicate] || predicate;
}

// Rounded-rectangle card node
function CardNode({ data, selected }: NodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const style = getNodeStyle(data.type);
  const isHighlighted = data.highlighted ?? false;
  const isDimmed = data.dimmed ?? false;
  const isDecision = data.type === 'DECISION';
  const isConflict = data.isConflict ?? false;
  const isRisk = data.type === 'RISK' || data.type === 'GENERATES_RISK';
  const conflictTooltip = data.conflictTooltip as string | undefined;

  const width = isDecision ? 220 : 170;
  const minHeight = isDecision ? 72 : 56;

  let bg = '#FFFFFF';
  let border = '#E5E7EB';
  let textColor = '#111827';
  let typeColor = '#9CA3AF';
  let shadow = '0 1px 3px rgba(0,0,0,0.06)';

  if (isDecision) {
    bg = '#111827';
    border = '#111827';
    textColor = '#FFFFFF';
    typeColor = 'rgba(255,255,255,0.6)';
    shadow = '0 4px 12px rgba(0,0,0,0.15)';
  } else if (isRisk) {
    bg = '#FEF2F2';
    border = '#FCA5A5';
    textColor = '#991B1B';
    typeColor = '#DC2626';
  } else if (isConflict) {
    bg = '#FFFBEB';
    border = '#FCD34D';
    textColor = '#92400E';
    typeColor = '#D97706';
  } else if (data.type === 'DATA_USAGE') {
    bg = '#EFF6FF';
    border = '#93C5FD';
    textColor = '#1E40AF';
    typeColor = '#3B82F6';
  }

  if (selected || isHighlighted) {
    shadow = '0 4px 16px rgba(0,0,0,0.12)';
  }

  const typeLabel = data.lang === 'en' ? (style.label_en || style.label) : style.label;

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <div
        onMouseEnter={() => conflictTooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          width: `${width}px`,
          minHeight: `${minHeight}px`,
          borderRadius: '12px',
          backgroundColor: bg,
          border: `1.5px solid ${border}`,
          boxShadow: shadow,
          padding: isDecision ? '14px 18px' : '10px 14px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: isDimmed ? 0.25 : 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '4px',
          position: 'relative',
          animation: isConflict && !isDimmed ? 'conflictPulse 2s ease-in-out infinite' : undefined,
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: typeColor,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          {typeLabel}
          {isConflict && (
            <span style={{ marginLeft: '4px', fontSize: '9px' }}>⚠</span>
          )}
        </div>
        <div
          style={{
            fontSize: isDecision ? '13px' : '11px',
            fontWeight: isDecision ? 700 : 600,
            color: textColor,
            lineHeight: '1.4',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: isDecision ? 4 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={data.fullLabel || data.label}
        >
          {data.label}
        </div>
        {/* Conflict insight card */}
        {showTooltip && conflictTooltip && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '12px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #F3E8C0',
              maxWidth: '320px',
              width: 'max-content',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(252,211,77,0.2)',
              zIndex: 50,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Card header */}
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#FFFBEB',
              borderBottom: '1px solid #FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>⚠️</span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#92400E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {data.lang === 'en' ? 'Strategic Conflict Detected' : '전략 충돌 감지'}
                </span>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 600,
                color: '#92400E',
                backgroundColor: '#FEF3C7',
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.3px',
              }}>
                Nova Reasoner
              </span>
            </div>
            {/* Card body */}
            <div style={{ padding: '12px 14px' }}>
              <p style={{
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#374151',
                margin: 0,
              }}>
                {conflictTooltip}
              </p>
            </div>
            {/* Arrow */}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #FFFFFF',
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))',
            }} />
          </div>
        )}
      </div>
    </>
  );
}

const nodeTypes = { card: CardNode };

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
  if (nodeType === 'RULE') return label.replace(/^rule_\w+:\s*/i, '');
  if (nodeType === 'KPI') return label.replace(/^K\d+:\s*/i, '');
  return label;
}

// Inject keyframe animation for conflict pulse
const CONFLICT_KEYFRAMES_ID = 'conflict-pulse-keyframes';
function ensureConflictKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CONFLICT_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = CONFLICT_KEYFRAMES_ID;
  style.textContent = `
    @keyframes conflictPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(252,211,77,0); }
      50% { box-shadow: 0 0 0 4px rgba(252,211,77,0.35); }
    }
  `;
  document.head.appendChild(style);
}

export function OntologyGraph({ data, lang, conflicts = [] }: OntologyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [coreEdgesOnly, setCoreEdgesOnly] = useState(false);
  const { fitView } = useReactFlow();

  useEffect(() => { ensureConflictKeyframes(); }, []);

  // Parse graph from graph_payload
  const { parsedNodes, parsedEdges } = useMemo(() => {
    const isEn = lang === 'en';
    if (!data?.graph_payload) return { parsedNodes: [], parsedEdges: [] };

    const graphPayload = data.graph_payload;
    if (!Array.isArray(graphPayload.nodes) || !Array.isArray(graphPayload.edges)) {
      return { parsedNodes: [], parsedEdges: [] };
    }

    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    graphPayload.nodes.forEach((node: GraphPayloadNode) => {
      const normalizedType = normalizeNodeType(node.type);
      const rawLabel = isEn
        ? (
            enSafe(node.label_en) ||
            enSafe(node.properties?.label_en as string) ||
            enSafe(node.properties?.name_en as string) ||
            enSafe(node.properties?.role_en as string) ||
            (normalizedType === 'KPI' ? enSafe(String(node.properties?.target ?? '')) || enSafe(node.properties?.metric as string) : null) ||
            node.label ||
            node.id
          )
        : (node.label || node.id);
      const cleanedLabel = cleanLabel(rawLabel, normalizedType);

      rfNodes.push({
        id: node.id,
        type: 'card',
        position: { x: 0, y: 0 },
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

    // Mark CONFLICTS_WITH — both source and target nodes
    const conflictNodeIds = new Set<string>();
    graphPayload.edges.forEach((edge: any) => {
      const predicate = edge.predicate || edge.relation || '';
      if (predicate === 'CONFLICTS_WITH') {
        const source = edge.source || edge.from;
        const target = edge.target || edge.to;
        if (source) conflictNodeIds.add(source);
        if (target) conflictNodeIds.add(target);
      }
    });
    // Build a combined conflict tooltip from reasoning contradictions
    const conflictTooltipText = conflicts.length > 0 ? conflicts.join(' · ') : undefined;
    rfNodes.forEach((n) => {
      if (conflictNodeIds.has(n.id)) {
        n.data.isConflict = true;
        n.data.conflictTooltip = conflictTooltipText;
      }
    });

    // Convert edges
    graphPayload.edges.forEach((edge: any, idx: number) => {
      const source = edge.source || edge.from;
      const target = edge.target || edge.to;
      const predicate = edge.predicate || edge.relation || '';
      if (!source || !target) return;

      const predicateLabel = getPredicateLabel(predicate, lang);
      const targetNode = graphPayload.nodes.find((n: any) => n.id === target);
      const normalizedTargetType = normalizeNodeType(targetNode?.type);
      const isRiskEdge = predicate === 'TRIGGERS' || predicate === 'GENERATES_RISK' || normalizedTargetType === 'GENERATES_RISK' || normalizedTargetType === 'RISK';
      const isConflictEdge = predicate === 'CONFLICTS_WITH';

      let edgeColor = '#D1D5DB';
      let labelColor = '#6B7280';

      if (isRiskEdge) {
        edgeColor = '#FCA5A5';
        labelColor = '#DC2626';
      } else if (isConflictEdge) {
        edgeColor = '#FCD34D';
        labelColor = '#D97706';
      }

      rfEdges.push({
        id: `${source}-${predicate}-${target}-${idx}`,
        source,
        target,
        type: 'default',
        animated: isConflictEdge || isRiskEdge,
        label: predicateLabel,
        labelStyle: { fill: labelColor, fontSize: 9, fontWeight: isConflictEdge ? 700 : 500 },
        labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.9 },
        labelBgPadding: [3, 5] as [number, number],
        labelBgBorderRadius: 3,
        style: { stroke: edgeColor, strokeWidth: isConflictEdge ? 2 : 1.5 },
        markerEnd: { type: MarkerType.Arrow, color: edgeColor, width: 12, height: 12, strokeWidth: 1.5 },
        data: {
          predicate,
          isCore: CORE_PREDICATES.has(predicate),
          edgeColor,
        },
      });
    });

    return { parsedNodes: rfNodes, parsedEdges: rfEdges };
  }, [data, lang, conflicts]);

  // Apply edge filter
  const filteredEdges = useMemo(() => {
    if (!coreEdgesOnly) return parsedEdges;
    return parsedEdges.filter(edge => edge.data?.isCore);
  }, [parsedEdges, coreEdgesOnly]);

  // Apply layout
  useEffect(() => {
    if (parsedNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      parsedNodes,
      filteredEdges,
      {
        direction: 'LR',
        nodeWidth: 190,
        nodeHeight: 80,
        rankSep: 180,
        nodeSep: 60,
      }
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    setTimeout(() => {
      fitView({ padding: 0.15, duration: 300 });
    }, 50);
  }, [parsedNodes, filteredEdges, setNodes, setEdges, fitView]);

  // Handle node click — highlight neighbors
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (selectedNode === node.id) {
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
            style: { ...e.style, opacity: 1, stroke: e.data?.edgeColor || '#D1D5DB' },
            animated: false,
          }))
        );
      } else {
        setSelectedNode(node.id);
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
            const originalColor = e.data?.edgeColor || '#D1D5DB';
            return {
              ...e,
              style: {
                ...e.style,
                opacity: isConnected ? 1 : 0.15,
                stroke: isConnected ? originalColor : '#E5E7EB',
              },
              animated: isConnected,
            };
          })
        );
      }
    },
    [selectedNode, edges, setNodes, setEdges]
  );

  if (!data?.graph_payload) return null;

  if (parsedNodes.length === 0 && parsedEdges.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>
        {lang === 'en' ? 'No relationship data available' : '관계 데이터가 아직 없습니다'}
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
          type: 'default',
          markerEnd: { type: MarkerType.Arrow, color: '#D1D5DB', width: 12, height: 12, strokeWidth: 1.5 },
          style: { stroke: '#D1D5DB', strokeWidth: 1.5 },
        }}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          showInteractive={false}
          style={{ bottom: 12, left: 12 }}
        />
      </ReactFlow>
    </div>
  );
}
