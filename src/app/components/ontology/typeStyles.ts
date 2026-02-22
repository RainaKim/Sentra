// Type styles for ontology nodes
// Professional B2B SaaS design - minimal colors, mostly grays with subtle accents

export interface NodeTypeStyle {
  color: string;
  borderColor: string;
  textColor: string;
  label: string;
}

export const NODE_TYPE_STYLES: Record<string, NodeTypeStyle> = {
  ACTOR: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '담당자',
  },
  GOAL: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '목표',
  },
  DECISION: {
    color: '#F9FAFB',
    borderColor: '#6B7280',
    textColor: '#111827',
    label: '의사 결정',
  },
  KPI: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '핵심지표',
  },
  COST: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '비용',
  },
  RISK: {
    color: '#FEF2F2',
    borderColor: '#EF4444',
    textColor: '#991B1B',
    label: '위험',
  },
  GENERATES_RISK: {
    color: '#FEF2F2',
    borderColor: '#EF4444',
    textColor: '#991B1B',
    label: '위험감지',
  },
  POLICY: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '정책',
  },
  RESOURCE: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '지역',
  },
  ENTITY: {
    color: '#FFFFFF',
    borderColor: '#D1D5DB',
    textColor: '#6B7280',
    label: '',
  },
  STRATEGIC_GOAL: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '전략 목표',
  },
  APPROVER: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '승인자',
  },
  REGION: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '지역',
  },
  RULE: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '규정',
  },
  GOAL_STRATEGIC: {
    color: '#F9FAFB',
    borderColor: '#9CA3AF',
    textColor: '#374151',
    label: '전략 목표',
  },
  DATA_USAGE: {
    color: '#EFF6FF',
    borderColor: '#3B82F6',
    textColor: '#1D4ED8',
    label: '데이터 사용',
  },
};

// Normalize backend type to our standard types
export function normalizeNodeType(type: string | undefined): string {
  if (!type) return 'ENTITY';

  const normalized = type.toUpperCase();

  // Map variations to standard types
  if (normalized === 'DECISION' || normalized === 'ACTION' || normalized === 'DECISIONROOT') {
    return 'DECISION';
  }
  if (normalized === 'ACTOR') return 'ACTOR';
  if (normalized === 'GOAL') return 'GOAL';
  if (normalized === 'KPI') return 'KPI';
  if (normalized === 'COST') return 'COST';
  if (normalized === 'RISK') return 'RISK';
  if (normalized === 'GENERATES_RISK') return 'GENERATES_RISK';
  if (normalized === 'POLICY') return 'POLICY';
  if (normalized === 'RESOURCE') return 'RESOURCE';
  if (normalized === 'STRATEGIC_GOAL') return 'STRATEGIC_GOAL';
  if (normalized === 'GOAL_STRATEGIC') return 'GOAL_STRATEGIC';
  if (normalized === 'APPROVER') return 'APPROVER';
  if (normalized === 'REGION') return 'REGION';
  if (normalized === 'RULE') return 'RULE';
  if (
    normalized === 'PII' ||
    normalized === 'PII_DATA' ||
    normalized === 'PII_FIELD' ||
    normalized === 'PERSONAL_DATA' ||
    normalized === 'DATA' ||
    normalized === 'DATA_ENTITY' ||
    normalized === 'DATA_FIELD' ||
    normalized === 'DATA_USAGE' ||
    normalized === 'USES_DATA'
  ) return 'DATA_USAGE';

  return 'ENTITY';
}

export function getNodeStyle(type: string | undefined): NodeTypeStyle {
  const normalizedType = normalizeNodeType(type);
  return NODE_TYPE_STYLES[normalizedType] || NODE_TYPE_STYLES.ENTITY;
}
