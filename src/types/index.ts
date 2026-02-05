// ============================================================================
// Core Entity Types for Provider Interaction & Inquiry Hub
// ============================================================================

// ============================================================================
// User & Team Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'specialist' | 'lead' | 'manager' | 'admin';
  team: string;
  capacity: number; // Max cases they can handle
  skills: string[]; // Category IDs they're skilled in
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leadId: string;
  memberIds: string[];
  categories: string[]; // Categories this team handles
  assignmentRule: 'round_robin' | 'least_loaded' | 'manual';
}

// ============================================================================
// Provider Types
// ============================================================================

export interface Address {
  id: string;
  type: 'practice' | 'billing' | 'mailing';
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  isPrimary: boolean;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface Provider {
  id: string;
  name: string;
  type: 'individual' | 'group' | 'facility';
  npi: string;
  taxId: string;
  specialties: string[];
  addresses: Address[];
  contacts: Contact[];
  lobs: string[]; // Lines of Business
  networkStatus: 'active' | 'pending' | 'terminated';
  credentialingStatus: 'current' | 'expired' | 'pending' | 'not_started';
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Case Types
// ============================================================================

export type CaseStatus = 'open' | 'in_progress' | 'pending_provider' | 'resolved' | 'closed';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type CaseChannel = 'phone' | 'email' | 'portal' | 'fax';

export interface SLAInfo {
  dueAt: string;
  pausedAt: string | null;
  pauseReason: string | null;
  totalPausedTime: number; // milliseconds
}

export interface CaseResolution {
  rootCause: string | null;
  disposition: string | null;
  summary: string | null;
  prevention: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface CaseTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  completedBy: string | null;
  createdAt: string;
}

export interface CaseAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Case {
  id: string;
  providerId: string;
  title: string;
  status: CaseStatus;
  priority: CasePriority;
  category: string;
  subcategory: string;
  lob: string;
  channel: CaseChannel;
  summary: string;
  assigneeId: string | null;
  teamId: string;
  sla: SLAInfo;
  resolution: CaseResolution;
  tasks: CaseTask[];
  attachments: CaseAttachment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============================================================================
// Interaction Types
// ============================================================================

export type InteractionType = 'call' | 'email' | 'meeting' | 'outreach';
export type InteractionDirection = 'inbound' | 'outbound';
export type Sentiment = 'positive' | 'neutral' | 'negative' | 'frustrated';

export interface StructuredCallNotes {
  reason: string;
  providerReported: string;
  whatWeChecked: string;
  whatWeAdvised: string;
  followUp: string;
  followUpOwner: string | null;
  followUpDueDate: string | null;
}

export interface InteractionAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface Interaction {
  id: string;
  providerId: string;
  caseId: string | null;
  type: InteractionType;
  direction: InteractionDirection;
  channel: string;
  occurredAt: string;
  duration: number; // minutes
  participants: string[];
  summary: string;
  notes: string;
  structuredNotes: StructuredCallNotes | null;
  sentiment: Sentiment;
  attachments: InteractionAttachment[];
  createdBy: string;
  createdAt: string;
}

// Email thread for simulated email interactions
export interface EmailMessage {
  id: string;
  interactionId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  timestamp: string;
  isInbound: boolean;
}

// ============================================================================
// Audit Types
// ============================================================================

export type AuditEntityType = 'case' | 'interaction' | 'provider' | 'outreach';
export type AuditAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'assigned'
  | 'reassigned'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'note_added'
  | 'task_added'
  | 'task_completed'
  | 'attachment_added'
  | 'sla_paused'
  | 'sla_resumed'
  | 'tag_added'
  | 'tag_removed'
  | 'interaction_linked'
  | 'priority_changed';

export interface AuditEvent {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  actorId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  description: string;
  previousValue?: unknown;
  newValue?: unknown;
}

// ============================================================================
// Outreach Types
// ============================================================================

export type OutreachEventType = 'webinar' | 'workshop' | 'training' | 'conference';

export interface OutreachEvent {
  id: string;
  type: OutreachEventType;
  title: string;
  topic: string;
  description: string;
  lob: string;
  audienceSegment: string;
  date: string;
  duration: number; // minutes
  location?: string;
  virtualLink?: string;
  attendeeIds: string[];
  maxAttendees?: number;
  notes: string;
  followUpActions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailBlast {
  id: string;
  title: string;
  subject: string;
  content: string;
  audienceSegment: string;
  lob: string;
  sentAt: string;
  recipientIds: string[];
  recipientCount: number;
  metrics: {
    opens: number;
    clicks: number;
    bounces: number;
    unsubscribes: number;
  };
  createdBy: string;
  createdAt: string;
}

// ============================================================================
// Knowledge Base Types
// ============================================================================

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  checklist: string[];
  relatedArticleIds: string[];
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  tone: 'formal' | 'friendly' | 'urgent';
  variables: string[]; // Placeholders like {{provider_name}}
  createdAt: string;
  updatedAt: string;
}

export interface ResolutionTemplate {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  tasks: string[];
  suggestedResolution: string;
  rootCauses: string[];
  dispositions: string[];
  preventionTips: string[];
  createdAt: string;
}

// ============================================================================
// Admin Configuration Types
// ============================================================================

export interface SLAPolicy {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  priority: CasePriority;
  lob?: string;
  targetHours: number; // Hours to resolution
  warningThreshold: number; // Percentage (e.g., 75 means warn at 75% of time used)
  allowPause: boolean;
  pauseReasons: string[];
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
  defaultPriority: CasePriority;
  defaultTeamId: string;
  slaHours: Record<CasePriority, number>;
  isActive: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
}

export interface DispositionCode {
  id: string;
  code: string;
  name: string;
  description: string;
  category?: string;
  isActive: boolean;
}

export interface RootCause {
  id: string;
  code: string;
  name: string;
  description: string;
  category?: string;
  isActive: boolean;
}

export interface AssignmentRule {
  id: string;
  name: string;
  priority: number; // Lower = higher priority
  conditions: {
    categories?: string[];
    subcategories?: string[];
    lobs?: string[];
    priorities?: CasePriority[];
  };
  targetTeamId: string;
  isActive: boolean;
}

// ============================================================================
// AI Assist Types
// ============================================================================

export interface ClassificationSuggestion {
  category: string;
  subcategory: string;
  confidence: number; // 0-100
  reasoning: string;
}

export interface SimilarCase {
  caseId: string;
  similarity: number; // 0-100
  title: string;
  category: string;
  resolution?: string;
  resolutionTime?: number; // hours
}

export interface SuggestedAction {
  id: string;
  type: 'task' | 'note' | 'email' | 'escalate' | 'close';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DraftResponse {
  id: string;
  type: 'email' | 'call_script';
  tone: 'formal' | 'friendly' | 'urgent';
  subject?: string;
  body: string;
}

export interface AIAssistContext {
  caseId?: string;
  providerId?: string;
  classification?: ClassificationSuggestion;
  similarCases?: SimilarCase[];
  suggestedActions?: SuggestedAction[];
  draftResponses?: DraftResponse[];
  slaRiskReason?: string;
  sentimentAnalysis?: {
    sentiment: Sentiment;
    keywords: string[];
    escalationRisk: boolean;
  };
  summary?: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface FilterState {
  search: string;
  status: CaseStatus[];
  priority: CasePriority[];
  category: string[];
  subcategory: string[];
  lob: string[];
  assignee: string[];
  team: string[];
  channel: CaseChannel[];
  slaState: ('on_track' | 'at_risk' | 'breached')[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export interface SavedView {
  id: string;
  name: string;
  filters: Partial<FilterState>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isDefault: boolean;
  createdBy: string;
}

export type SLAState = 'on_track' | 'at_risk' | 'breached';

export interface KPIData {
  openCases: number;
  assignedToMe: number;
  unassigned: number;
  dueIn24h: number;
  breached: number;
  avgResolutionTime: number; // hours
  repeatProviderRate: number; // percentage
}

// ============================================================================
// Report Types
// ============================================================================

export interface SLAComplianceData {
  period: string;
  total: number;
  onTime: number;
  breached: number;
  complianceRate: number;
}

export interface VolumeByCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface ResolutionPerformance {
  period: string;
  avgTime: number;
  medianTime: number;
  p90Time: number;
}

export interface OutreachImpact {
  eventId: string;
  eventTitle: string;
  attendeeCount: number;
  preEventInquiries: number;
  postEventInquiries: number;
  changePercent: number;
}
