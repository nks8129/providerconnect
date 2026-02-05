import type { Category, CasePriority } from '@/types';

// ============================================================================
// Provider Inquiry Categories
// ============================================================================

export const CATEGORIES: Category[] = [
  {
    id: 'cat_claims',
    name: 'Claims & Payment',
    description: 'Claim status, denials, remittance, and payment inquiries',
    subcategories: [
      { id: 'sub_claim_status', name: 'Claim Status', description: 'Inquiries about claim processing status' },
      { id: 'sub_denial', name: 'Denial Reason', description: 'Questions about claim denials and appeal guidance' },
      { id: 'sub_remittance', name: 'Remittance Questions', description: 'ERA/EOP explanation and discrepancies' },
      { id: 'sub_payment_delay', name: 'Payment Delay', description: 'Late or missing payments' },
      { id: 'sub_adjustment', name: 'Adjustment Request', description: 'Requests for claim adjustments' },
    ],
    defaultPriority: 'medium',
    defaultTeamId: 'team_claims',
    slaHours: { urgent: 4, high: 8, medium: 24, low: 48 },
    isActive: true,
  },
  {
    id: 'cat_eligibility',
    name: 'Eligibility & Benefits',
    description: 'Member eligibility verification and benefit inquiries',
    subcategories: [
      { id: 'sub_elig_verify', name: 'Eligibility Verification', description: 'Member coverage confirmation' },
      { id: 'sub_benefit_info', name: 'Benefit Information', description: 'Coverage details and limitations' },
      { id: 'sub_cob', name: 'Coordination of Benefits', description: 'COB issues and primary/secondary payer' },
      { id: 'sub_elig_discrepancy', name: 'Eligibility Discrepancy', description: 'Mismatch between records' },
    ],
    defaultPriority: 'medium',
    defaultTeamId: 'team_eligibility',
    slaHours: { urgent: 2, high: 4, medium: 12, low: 24 },
    isActive: true,
  },
  {
    id: 'cat_prior_auth',
    name: 'Prior Authorization',
    description: 'Prior authorization status and utilization management',
    subcategories: [
      { id: 'sub_auth_status', name: 'Authorization Status', description: 'Check on pending auth requests' },
      { id: 'sub_auth_missing', name: 'Missing Information', description: 'Auth requests needing additional info' },
      { id: 'sub_auth_appeal', name: 'Authorization Appeal', description: 'Appealing denied authorizations' },
      { id: 'sub_auth_urgent', name: 'Urgent Auth Request', description: 'Time-sensitive auth needs' },
    ],
    defaultPriority: 'high',
    defaultTeamId: 'team_um',
    slaHours: { urgent: 2, high: 4, medium: 8, low: 24 },
    isActive: true,
  },
  {
    id: 'cat_credentialing',
    name: 'Credentialing',
    description: 'Provider onboarding, recredentialing, and documentation',
    subcategories: [
      { id: 'sub_cred_status', name: 'Credentialing Status', description: 'Application status check' },
      { id: 'sub_cred_docs', name: 'Missing Documents', description: 'Required documentation requests' },
      { id: 'sub_recred', name: 'Recredentialing', description: 'Renewal and recredentialing process' },
      { id: 'sub_cred_update', name: 'Credential Update', description: 'License or certification updates' },
    ],
    defaultPriority: 'medium',
    defaultTeamId: 'team_credentialing',
    slaHours: { urgent: 8, high: 24, medium: 72, low: 120 },
    isActive: true,
  },
  {
    id: 'cat_contracting',
    name: 'Contracting',
    description: 'Network participation, fee schedules, and contract questions',
    subcategories: [
      { id: 'sub_network_status', name: 'Network Status', description: 'In-network participation questions' },
      { id: 'sub_fee_schedule', name: 'Fee Schedule', description: 'Reimbursement rate inquiries' },
      { id: 'sub_contract_terms', name: 'Contract Terms', description: 'Agreement terms and conditions' },
      { id: 'sub_rate_review', name: 'Rate Review Request', description: 'Fee schedule negotiation' },
    ],
    defaultPriority: 'low',
    defaultTeamId: 'team_contracting',
    slaHours: { urgent: 24, high: 48, medium: 96, low: 168 },
    isActive: true,
  },
  {
    id: 'cat_directory',
    name: 'Provider Directory',
    description: 'Address, phone, roster changes and directory updates',
    subcategories: [
      { id: 'sub_address_update', name: 'Address Update', description: 'Practice location changes' },
      { id: 'sub_phone_update', name: 'Phone/Fax Update', description: 'Contact number changes' },
      { id: 'sub_roster_change', name: 'Roster Change', description: 'Add/remove providers from group' },
      { id: 'sub_directory_error', name: 'Directory Error', description: 'Incorrect listing correction' },
    ],
    defaultPriority: 'medium',
    defaultTeamId: 'team_data',
    slaHours: { urgent: 4, high: 8, medium: 24, low: 72 },
    isActive: true,
  },
  {
    id: 'cat_portal',
    name: 'Portal & EDI',
    description: 'Portal access, login issues, ERA/EFT enrollment, technical support',
    subcategories: [
      { id: 'sub_login_issue', name: 'Login Issue', description: 'Portal access and password problems' },
      { id: 'sub_era_eft', name: 'ERA/EFT Enrollment', description: 'Electronic remittance and payment setup' },
      { id: 'sub_edi_issue', name: 'EDI Issue', description: 'Claim submission technical problems' },
      { id: 'sub_portal_error', name: 'Portal Error', description: 'Website functionality issues' },
    ],
    defaultPriority: 'high',
    defaultTeamId: 'team_technical',
    slaHours: { urgent: 2, high: 4, medium: 8, low: 24 },
    isActive: true,
  },
  {
    id: 'cat_grievance',
    name: 'Grievances & Appeals',
    description: 'Provider grievances, complaints, and appeal support',
    subcategories: [
      { id: 'sub_grievance', name: 'Provider Grievance', description: 'Formal complaints and concerns' },
      { id: 'sub_appeal_support', name: 'Appeal Support', description: 'Guidance on appeals process' },
      { id: 'sub_complaint', name: 'Complaint', description: 'General complaints and issues' },
      { id: 'sub_escalation', name: 'Escalation Request', description: 'Request to escalate to management' },
    ],
    defaultPriority: 'high',
    defaultTeamId: 'team_appeals',
    slaHours: { urgent: 4, high: 8, medium: 24, low: 48 },
    isActive: true,
  },
];

// ============================================================================
// Lines of Business
// ============================================================================

export const LINES_OF_BUSINESS = [
  { id: 'lob_commercial', name: 'Commercial', description: 'Employer-sponsored plans' },
  { id: 'lob_medicare', name: 'Medicare Advantage', description: 'Medicare plans' },
  { id: 'lob_medicaid', name: 'Medicaid', description: 'Medicaid managed care' },
  { id: 'lob_exchange', name: 'Exchange', description: 'ACA marketplace plans' },
];

// ============================================================================
// Provider Specialties
// ============================================================================

export const SPECIALTIES = [
  { id: 'spec_pcp', name: 'Primary Care', code: 'PCP' },
  { id: 'spec_cardio', name: 'Cardiology', code: 'CARD' },
  { id: 'spec_ortho', name: 'Orthopedics', code: 'ORTH' },
  { id: 'spec_mental', name: 'Mental Health', code: 'MH' },
  { id: 'spec_obgyn', name: 'OB/GYN', code: 'OBGYN' },
  { id: 'spec_peds', name: 'Pediatrics', code: 'PED' },
  { id: 'spec_derm', name: 'Dermatology', code: 'DERM' },
  { id: 'spec_urgent', name: 'Urgent Care', code: 'UC' },
  { id: 'spec_hospital', name: 'Hospital/Facility', code: 'FAC' },
  { id: 'spec_lab', name: 'Laboratory', code: 'LAB' },
  { id: 'spec_imaging', name: 'Radiology/Imaging', code: 'RAD' },
  { id: 'spec_pt', name: 'Physical Therapy', code: 'PT' },
];

// ============================================================================
// US States (for provider addresses)
// ============================================================================

export const US_STATES = [
  { code: 'CA', name: 'California' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'NY', name: 'New York' },
  { code: 'IL', name: 'Illinois' },
];

// ============================================================================
// Disposition Codes
// ============================================================================

export const DISPOSITION_CODES = [
  { id: 'disp_resolved', code: 'RES', name: 'Resolved', description: 'Issue fully resolved' },
  { id: 'disp_info_provided', code: 'INF', name: 'Information Provided', description: 'Inquiry answered with information' },
  { id: 'disp_referred', code: 'REF', name: 'Referred', description: 'Referred to another department' },
  { id: 'disp_pending', code: 'PEN', name: 'Pending External', description: 'Awaiting external action' },
  { id: 'disp_duplicate', code: 'DUP', name: 'Duplicate', description: 'Duplicate of existing case' },
  { id: 'disp_no_action', code: 'NAR', name: 'No Action Required', description: 'Issue resolved itself' },
  { id: 'disp_escalated', code: 'ESC', name: 'Escalated', description: 'Escalated to management' },
];

// ============================================================================
// Root Causes
// ============================================================================

export const ROOT_CAUSES = [
  { id: 'rc_system_error', code: 'SYS', name: 'System Error', description: 'Technical or system issue' },
  { id: 'rc_data_error', code: 'DAT', name: 'Data Error', description: 'Incorrect or missing data' },
  { id: 'rc_process_gap', code: 'PRO', name: 'Process Gap', description: 'Procedural issue or gap' },
  { id: 'rc_provider_error', code: 'PRV', name: 'Provider Error', description: 'Error on provider side' },
  { id: 'rc_member_issue', code: 'MEM', name: 'Member Issue', description: 'Member-related issue' },
  { id: 'rc_vendor_issue', code: 'VEN', name: 'Vendor Issue', description: 'Third-party vendor problem' },
  { id: 'rc_training_gap', code: 'TRN', name: 'Training Gap', description: 'Knowledge or training issue' },
  { id: 'rc_policy_change', code: 'POL', name: 'Policy Change', description: 'Recent policy or guideline change' },
  { id: 'rc_no_issue', code: 'NON', name: 'No Issue Found', description: 'Working as designed' },
];

// ============================================================================
// Pause Reasons (for SLA)
// ============================================================================

export const SLA_PAUSE_REASONS = [
  { id: 'pause_waiting_provider', name: 'Waiting on Provider', description: 'Awaiting provider response or documentation' },
  { id: 'pause_waiting_member', name: 'Waiting on Member', description: 'Awaiting member action' },
  { id: 'pause_waiting_vendor', name: 'Waiting on Vendor', description: 'Awaiting third-party response' },
  { id: 'pause_escalated', name: 'Escalated', description: 'Under management review' },
  { id: 'pause_external', name: 'External Hold', description: 'Awaiting external department' },
];

// ============================================================================
// Interaction Channels
// ============================================================================

export const INTERACTION_CHANNELS = [
  { id: 'channel_phone', name: 'Phone', icon: 'phone' },
  { id: 'channel_email', name: 'Email', icon: 'mail' },
  { id: 'channel_portal', name: 'Portal Message', icon: 'message-square' },
  { id: 'channel_fax', name: 'Fax', icon: 'printer' },
  { id: 'channel_meeting', name: 'Meeting', icon: 'users' },
  { id: 'channel_webinar', name: 'Webinar', icon: 'video' },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getSubcategoryById(categoryId: string, subcategoryId: string) {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find((s) => s.id === subcategoryId);
}

export function getDefaultSLAHours(categoryId: string, priority: CasePriority): number {
  const category = getCategoryById(categoryId);
  return category?.slaHours[priority] ?? 24;
}

export function getLOBById(id: string) {
  return LINES_OF_BUSINESS.find((l) => l.id === id);
}

export function getSpecialtyById(id: string) {
  return SPECIALTIES.find((s) => s.id === id);
}
