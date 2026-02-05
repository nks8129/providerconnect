// ============================================================================
// Email Templates & Resolution Templates
// ============================================================================

import type { EmailTemplate, ResolutionTemplate } from '@/types';

// ============================================================================
// Email Templates
// ============================================================================

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // Claims templates
  {
    id: 'tpl_email_claim_status',
    name: 'Claim Status Update',
    category: 'cat_claims',
    subject: 'Claim Status Update - {{claim_number}}',
    body: `Dear {{provider_name}},

Thank you for your inquiry regarding claim {{claim_number}}.

Claim Details:
- Service Date: {{service_date}}
- Billed Amount: {{billed_amount}}
- Current Status: {{claim_status}}

{{status_details}}

If you have additional questions, please reply to this email or call our Provider Relations line.

Best regards,
{{agent_name}}
Provider Relations Team`,
    tone: 'formal',
    variables: ['provider_name', 'claim_number', 'service_date', 'billed_amount', 'claim_status', 'status_details', 'agent_name'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_email_denial_explanation',
    name: 'Denial Explanation',
    category: 'cat_claims',
    subject: 'Claim Denial Explanation - {{claim_number}}',
    body: `Dear {{provider_name}},

We are writing regarding the denial of claim {{claim_number}}.

Denial Details:
- Denial Code: {{denial_code}}
- Denial Reason: {{denial_reason}}
- Service Date: {{service_date}}

To Appeal This Decision:
1. Submit a written appeal within 60 days of this notice
2. Include any supporting documentation
3. Reference claim number {{claim_number}}

Appeals can be submitted:
- Online: provider.healthplan.com/appeals
- Fax: 1-800-XXX-XXXX
- Mail: [Appeals Address]

If you have questions about this denial, please contact us.

Best regards,
{{agent_name}}
Provider Relations Team`,
    tone: 'formal',
    variables: ['provider_name', 'claim_number', 'denial_code', 'denial_reason', 'service_date', 'agent_name'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Eligibility templates
  {
    id: 'tpl_email_elig_confirm',
    name: 'Eligibility Confirmation',
    category: 'cat_eligibility',
    subject: 'Member Eligibility Verification - {{member_id}}',
    body: `Dear {{provider_name}},

Per your request, please find the eligibility information for the following member:

Member Information:
- Member ID: {{member_id}}
- Name: {{member_name}}
- Date of Birth: {{member_dob}}

Coverage Details:
- Plan: {{plan_name}}
- Effective Date: {{effective_date}}
- Termination Date: {{term_date}}
- Status: {{eligibility_status}}

Benefits Summary:
{{benefits_summary}}

Please note: This eligibility verification is valid as of {{verification_date}}. We recommend verifying eligibility at the time of service.

Best regards,
{{agent_name}}
Provider Relations Team`,
    tone: 'formal',
    variables: ['provider_name', 'member_id', 'member_name', 'member_dob', 'plan_name', 'effective_date', 'term_date', 'eligibility_status', 'benefits_summary', 'verification_date', 'agent_name'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Prior Auth templates
  {
    id: 'tpl_email_auth_approved',
    name: 'Authorization Approved',
    category: 'cat_prior_auth',
    subject: 'Prior Authorization Approved - {{auth_number}}',
    body: `Dear {{provider_name}},

We are pleased to inform you that the following prior authorization has been APPROVED:

Authorization Details:
- Auth Number: {{auth_number}}
- Member: {{member_name}}
- Service: {{service_description}}
- Approved Units: {{approved_units}}
- Valid From: {{valid_from}}
- Valid To: {{valid_to}}

Please ensure services are rendered within the authorization period and do not exceed approved units.

Include the authorization number on all claims submitted for this service.

Best regards,
{{agent_name}}
Utilization Management Team`,
    tone: 'formal',
    variables: ['provider_name', 'auth_number', 'member_name', 'service_description', 'approved_units', 'valid_from', 'valid_to', 'agent_name'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_email_auth_missing_info',
    name: 'Authorization Missing Information',
    category: 'cat_prior_auth',
    subject: 'ACTION REQUIRED: Missing Information for Auth Request - {{auth_number}}',
    body: `Dear {{provider_name}},

Your prior authorization request {{auth_number}} requires additional information before we can complete our review.

Missing Items:
{{missing_items}}

Please submit the required documentation by {{due_date}} to avoid delays.

Submission Methods:
- Provider Portal: provider.healthplan.com
- Fax: 1-800-XXX-XXXX
- Reference: {{auth_number}}

If you have questions, please contact our UM department.

Best regards,
{{agent_name}}
Utilization Management Team`,
    tone: 'urgent',
    variables: ['provider_name', 'auth_number', 'missing_items', 'due_date', 'agent_name'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Credentialing templates
  {
    id: 'tpl_email_cred_welcome',
    name: 'Credentialing Welcome',
    category: 'cat_credentialing',
    subject: 'Welcome to the Network - Credentialing Approved',
    body: `Dear {{provider_name}},

Congratulations! We are pleased to inform you that your credentialing application has been approved.

Effective Date: {{effective_date}}

You are now an in-network provider with the following lines of business:
{{approved_lobs}}

Next Steps:
1. Register for the Provider Portal at provider.healthplan.com
2. Review the Provider Manual
3. Set up ERA/EFT for electronic payments
4. Update your practice information if needed

We look forward to working with you to serve our members.

Welcome to the network!

Best regards,
{{agent_name}}
Credentialing Team`,
    tone: 'friendly',
    variables: ['provider_name', 'effective_date', 'approved_lobs', 'agent_name'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // General templates
  {
    id: 'tpl_email_case_acknowledge',
    name: 'Case Acknowledgment',
    category: 'general',
    subject: 'We Received Your Inquiry - Case {{case_number}}',
    body: `Dear {{provider_name}},

Thank you for contacting Provider Relations. We have received your inquiry and created a case for tracking.

Case Number: {{case_number}}
Subject: {{case_subject}}
Submitted: {{submit_date}}

A member of our team will review your inquiry and respond within {{sla_timeframe}}.

If you need to provide additional information, please reply to this email and reference your case number.

Best regards,
{{agent_name}}
Provider Relations Team`,
    tone: 'formal',
    variables: ['provider_name', 'case_number', 'case_subject', 'submit_date', 'sla_timeframe', 'agent_name'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_email_case_resolved',
    name: 'Case Resolved',
    category: 'general',
    subject: 'Your Inquiry Has Been Resolved - Case {{case_number}}',
    body: `Dear {{provider_name}},

We are writing to confirm that case {{case_number}} has been resolved.

Resolution Summary:
{{resolution_summary}}

If you have additional questions or concerns, please don't hesitate to contact us. You can also reopen this case by replying to this email.

Thank you for your patience and for being a valued network provider.

Best regards,
{{agent_name}}
Provider Relations Team`,
    tone: 'formal',
    variables: ['provider_name', 'case_number', 'resolution_summary', 'agent_name'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ============================================================================
// Resolution Templates
// ============================================================================

export const RESOLUTION_TEMPLATES: ResolutionTemplate[] = [
  {
    id: 'tpl_res_claim_denial_appeal',
    name: 'Claim Denial - Appeal Guidance',
    category: 'cat_claims',
    subcategory: 'sub_denial',
    tasks: [
      'Review claim denial details in system',
      'Identify specific denial reason code',
      'Check if claim is eligible for appeal',
      'Provide appeal instructions to provider',
      'Document guidance provided',
    ],
    suggestedResolution: 'Provided detailed appeal instructions including submission requirements, timeline, and supporting documentation needed. Provider understands the process and will submit appeal.',
    rootCauses: ['rc_data_error', 'rc_provider_error', 'rc_process_gap'],
    dispositions: ['disp_info_provided', 'disp_resolved'],
    preventionTips: [
      'Recommend provider verify eligibility before service',
      'Suggest reviewing claim scrubbing process',
      'Share common denial reason prevention guide',
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_res_claim_payment',
    name: 'Claim Payment Issue',
    category: 'cat_claims',
    subcategory: 'sub_payment_delay',
    tasks: [
      'Verify claim payment status',
      'Check remittance/ERA details',
      'Confirm payment method on file',
      'Research payment discrepancy if any',
      'Update payment information if needed',
    ],
    suggestedResolution: 'Verified payment status and provided remittance details. Payment was issued on [DATE] via [METHOD]. Provider confirmed receipt.',
    rootCauses: ['rc_system_error', 'rc_data_error', 'rc_process_gap'],
    dispositions: ['disp_resolved', 'disp_info_provided'],
    preventionTips: [
      'Encourage ERA/EFT enrollment for faster payments',
      'Verify banking information is current',
      'Set up payment notifications in portal',
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_res_eligibility',
    name: 'Eligibility Verification',
    category: 'cat_eligibility',
    subcategory: 'sub_elig_verify',
    tasks: [
      'Verify member eligibility in system',
      'Check effective dates and coverage',
      'Confirm benefit plan details',
      'Provide eligibility response to provider',
    ],
    suggestedResolution: 'Confirmed member eligibility status as of inquiry date. Provided coverage details and benefits summary.',
    rootCauses: ['rc_no_issue', 'rc_data_error'],
    dispositions: ['disp_info_provided'],
    preventionTips: [
      'Always verify eligibility at time of service',
      'Use real-time eligibility tools when available',
      'Check for retroactive terminations',
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_res_auth_status',
    name: 'Authorization Status Check',
    category: 'cat_prior_auth',
    subcategory: 'sub_auth_status',
    tasks: [
      'Look up authorization in UM system',
      'Review current status and any pending items',
      'Check for missing clinical documentation',
      'Provide status update to provider',
    ],
    suggestedResolution: 'Authorization status provided. Current status: [STATUS]. Provider informed of any next steps required.',
    rootCauses: ['rc_no_issue', 'rc_process_gap'],
    dispositions: ['disp_info_provided', 'disp_resolved'],
    preventionTips: [
      'Submit complete clinical documentation upfront',
      'Use the authorization portal for real-time status',
      'Allow adequate time for non-urgent requests',
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_res_cred_status',
    name: 'Credentialing Status Inquiry',
    category: 'cat_credentialing',
    subcategory: 'sub_cred_status',
    tasks: [
      'Check credentialing application status',
      'Review any pending items or missing documents',
      'Verify license and DEA status',
      'Provide status update and timeline',
    ],
    suggestedResolution: 'Credentialing application status provided. Application is in [PHASE] phase with estimated completion of [DATE].',
    rootCauses: ['rc_no_issue', 'rc_process_gap'],
    dispositions: ['disp_info_provided'],
    preventionTips: [
      'Submit all required documents with initial application',
      'Ensure licenses are current before applying',
      'Start recredentialing process 90 days before expiration',
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_res_directory_update',
    name: 'Directory Update Request',
    category: 'cat_directory',
    subcategory: 'sub_address_update',
    tasks: [
      'Verify current directory listing',
      'Document requested changes',
      'Submit update to data team',
      'Confirm processing timeline',
    ],
    suggestedResolution: 'Directory update request submitted. Changes will be reflected within [TIMEFRAME]. Provider advised to verify listing after update.',
    rootCauses: ['rc_no_issue'],
    dispositions: ['disp_resolved'],
    preventionTips: [
      'Keep practice information current in provider portal',
      'Submit roster changes promptly',
      'Verify directory listing quarterly',
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_res_portal_access',
    name: 'Portal Access Issue',
    category: 'cat_portal',
    subcategory: 'sub_login_issue',
    tasks: [
      'Verify provider portal registration',
      'Check account status (active/locked)',
      'Reset password if needed',
      'Provide login instructions',
    ],
    suggestedResolution: 'Portal access issue resolved. Password was reset and provider successfully logged in. Provided guidance on portal features.',
    rootCauses: ['rc_system_error', 'rc_training_gap'],
    dispositions: ['disp_resolved'],
    preventionTips: [
      'Save login credentials securely',
      'Use password manager',
      'Contact support before multiple failed attempts',
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getEmailTemplatesByCategory(categoryId: string): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter((t) => t.category === categoryId || t.category === 'general');
}

export function getResolutionTemplatesByCategory(categoryId: string, subcategoryId?: string): ResolutionTemplate[] {
  return RESOLUTION_TEMPLATES.filter((t) => {
    if (t.category !== categoryId) return false;
    if (subcategoryId && t.subcategory && t.subcategory !== subcategoryId) return false;
    return true;
  });
}

export function getEmailTemplateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id);
}

export function getResolutionTemplateById(id: string): ResolutionTemplate | undefined {
  return RESOLUTION_TEMPLATES.find((t) => t.id === id);
}

/**
 * Replace variables in template text
 */
export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}
