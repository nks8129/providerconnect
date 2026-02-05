// ============================================================================
// Canned AI Responses for Simulated AI Assist
// ============================================================================

import type { DraftResponse, SuggestedAction } from '@/types';

// ============================================================================
// Email Draft Templates by Category
// ============================================================================

export const EMAIL_DRAFTS: Record<string, DraftResponse[]> = {
  cat_claims: [
    {
      id: 'draft_claims_status_formal',
      type: 'email',
      tone: 'formal',
      subject: 'Re: Claim Status Inquiry - [CLAIM_NUMBER]',
      body: `Dear Provider,

Thank you for contacting us regarding your claim inquiry.

We have reviewed the claim in question and can provide the following update:

[CLAIM_STATUS_DETAILS]

If you have any additional questions or need further clarification, please don't hesitate to reach out. We are committed to resolving this matter promptly.

Best regards,
Provider Relations Team`,
    },
    {
      id: 'draft_claims_denial_formal',
      type: 'email',
      tone: 'formal',
      subject: 'Re: Claim Denial Explanation - [CLAIM_NUMBER]',
      body: `Dear Provider,

Thank you for reaching out regarding the denial of claim [CLAIM_NUMBER].

After reviewing the claim, we found that it was denied for the following reason:

[DENIAL_REASON]

To appeal this decision, please:
1. Submit a written appeal within 60 days
2. Include supporting documentation
3. Reference the original claim number

If you believe this denial was made in error, please contact our appeals department.

Best regards,
Provider Relations Team`,
    },
    {
      id: 'draft_claims_friendly',
      type: 'email',
      tone: 'friendly',
      subject: 'Re: Your Claim Question',
      body: `Hi there,

Thanks for reaching out about your claim! I've looked into it and here's what I found:

[CLAIM_DETAILS]

Let me know if you have any other questions - happy to help!

Best,
Provider Relations`,
    },
  ],
  cat_eligibility: [
    {
      id: 'draft_elig_verify',
      type: 'email',
      tone: 'formal',
      subject: 'Re: Member Eligibility Verification',
      body: `Dear Provider,

Thank you for your eligibility verification request.

Based on our records, the member's eligibility status is as follows:

[ELIGIBILITY_DETAILS]

Please note that eligibility should be verified at the time of service. This response represents eligibility as of [DATE].

Best regards,
Provider Relations Team`,
    },
    {
      id: 'draft_elig_cob',
      type: 'email',
      tone: 'formal',
      subject: 'Re: Coordination of Benefits Inquiry',
      body: `Dear Provider,

Thank you for your inquiry regarding coordination of benefits for the member.

Our records indicate:
- Primary Insurance: [PRIMARY_INFO]
- Our coverage is: [PRIMARY/SECONDARY]

For COB claims, please submit with the primary EOB attached.

Best regards,
Provider Relations Team`,
    },
  ],
  cat_prior_auth: [
    {
      id: 'draft_auth_status',
      type: 'email',
      tone: 'formal',
      subject: 'Re: Prior Authorization Status - [AUTH_NUMBER]',
      body: `Dear Provider,

Thank you for your inquiry regarding the prior authorization request.

Current Status: [AUTH_STATUS]
Request Date: [REQUEST_DATE]
Service Requested: [SERVICE]

[STATUS_SPECIFIC_DETAILS]

For urgent matters, please call our Prior Authorization line directly.

Best regards,
Utilization Management Team`,
    },
    {
      id: 'draft_auth_missing_info',
      type: 'email',
      tone: 'urgent',
      subject: 'URGENT: Missing Information for Prior Authorization - [AUTH_NUMBER]',
      body: `Dear Provider,

Your prior authorization request requires additional information before we can proceed:

Missing Items:
[MISSING_ITEMS_LIST]

Please submit the required documentation within [TIMEFRAME] to avoid delays in processing.

Fax to: [FAX_NUMBER]
Or upload via the provider portal.

Best regards,
Utilization Management Team`,
    },
  ],
  cat_credentialing: [
    {
      id: 'draft_cred_status',
      type: 'email',
      tone: 'formal',
      subject: 'Re: Credentialing Application Status',
      body: `Dear Provider,

Thank you for your inquiry regarding your credentialing application.

Application Status: [STATUS]
Submitted Date: [SUBMIT_DATE]
Expected Completion: [EXPECTED_DATE]

[STATUS_SPECIFIC_INFO]

If you have questions, please contact our Credentialing department.

Best regards,
Credentialing Team`,
    },
    {
      id: 'draft_cred_missing_docs',
      type: 'email',
      tone: 'formal',
      subject: 'Re: Missing Credentialing Documents',
      body: `Dear Provider,

Your credentialing application is pending the following documents:

[MISSING_DOCUMENTS_LIST]

Please submit these items at your earliest convenience to continue processing your application.

Submission methods:
- Portal: [PORTAL_LINK]
- Fax: [FAX_NUMBER]
- Email: credentialing@healthplan.com

Best regards,
Credentialing Team`,
    },
  ],
  cat_directory: [
    {
      id: 'draft_directory_update_confirm',
      type: 'email',
      tone: 'formal',
      subject: 'Re: Provider Directory Update Request',
      body: `Dear Provider,

Thank you for submitting your directory update request.

We have received your request to update:
[UPDATE_DETAILS]

This change will be reflected in our systems within [TIMEFRAME].

Please verify your information is correct on our online directory after this date.

Best regards,
Provider Data Team`,
    },
  ],
  cat_portal: [
    {
      id: 'draft_portal_login',
      type: 'email',
      tone: 'friendly',
      subject: 'Re: Portal Login Assistance',
      body: `Hi,

I understand you're having trouble accessing the provider portal. Here are some steps to help:

1. Clear your browser cache and cookies
2. Try a different browser (Chrome or Edge recommended)
3. Use the "Forgot Password" link to reset your credentials
4. If locked out, wait 30 minutes before trying again

If you're still having issues, I can request a password reset from our IT team.

Let me know how it goes!

Best,
Provider Relations`,
    },
    {
      id: 'draft_era_eft_setup',
      type: 'email',
      tone: 'formal',
      subject: 'Re: ERA/EFT Enrollment Request',
      body: `Dear Provider,

Thank you for your interest in electronic remittance (ERA) and electronic funds transfer (EFT).

To enroll, please complete the following steps:
1. Log into the provider portal
2. Navigate to "Payment Settings"
3. Complete the ERA/EFT enrollment form
4. Submit your banking information with a voided check

Processing typically takes 2-3 billing cycles.

Best regards,
Provider Relations Team`,
    },
  ],
  general: [
    {
      id: 'draft_general_acknowledge',
      type: 'email',
      tone: 'formal',
      subject: 'Re: Your Inquiry',
      body: `Dear Provider,

Thank you for contacting Provider Relations. We have received your inquiry and are currently reviewing it.

A member of our team will follow up with you within [TIMEFRAME].

Case Reference: [CASE_NUMBER]

Best regards,
Provider Relations Team`,
    },
    {
      id: 'draft_general_followup',
      type: 'email',
      tone: 'friendly',
      subject: 'Following Up on Your Inquiry',
      body: `Hi,

I wanted to follow up on our recent conversation regarding [TOPIC].

[FOLLOWUP_DETAILS]

Please let me know if you have any questions or need anything else.

Thanks,
Provider Relations`,
    },
  ],
};

// ============================================================================
// Call Script Templates
// ============================================================================

export const CALL_SCRIPTS: Record<string, DraftResponse[]> = {
  cat_claims: [
    {
      id: 'script_claims_status',
      type: 'call_script',
      tone: 'formal',
      body: `Opening: "Thank you for calling Provider Relations, this is [NAME]. How may I assist you today?"

Verify caller: "May I have your NPI or Tax ID to locate your account?"

For claim status:
- "I can see that claim [NUMBER] was received on [DATE]"
- "The current status is [STATUS]"
- If pending: "It's currently being processed and should finalize within [TIMEFRAME]"
- If denied: "This claim was denied for [REASON]. Would you like information on the appeals process?"

Closing: "Is there anything else I can help you with today?"`,
    },
  ],
  cat_eligibility: [
    {
      id: 'script_elig_verify',
      type: 'call_script',
      tone: 'formal',
      body: `Opening: "Thank you for calling Provider Relations. How may I assist you?"

Verify caller and member:
- "May I have your NPI?"
- "And the member's ID and date of birth?"

Eligibility response:
- "The member is [ACTIVE/INACTIVE] as of [DATE]"
- "Their plan is [PLAN_NAME]"
- "Primary care benefits include [DETAILS]"

Important note: "Please remember to verify eligibility at time of service, as this can change."

Closing: "Is there anything else I can help you with?"`,
    },
  ],
  general: [
    {
      id: 'script_general_opening',
      type: 'call_script',
      tone: 'friendly',
      body: `Opening: "Thank you for calling [HEALTH_PLAN] Provider Relations, my name is [NAME]. How can I help you today?"

Active listening tips:
- Let the caller explain their issue fully
- Take notes on key details
- Confirm understanding: "So what I'm hearing is..."

If you need to research:
- "Let me look into that for you. Do you mind holding for a moment?"
- Check back every 1-2 minutes if research takes longer

Resolution:
- Summarize what was discussed
- Confirm any actions taken
- Provide reference numbers

Closing: "Is there anything else I can assist you with today? Thank you for calling!"`,
    },
  ],
};

// ============================================================================
// Suggested Actions by Category
// ============================================================================

export const SUGGESTED_ACTIONS: Record<string, SuggestedAction[]> = {
  cat_claims: [
    { id: 'action_verify_claim', type: 'task', title: 'Verify claim details in system', description: 'Check claim status, dates, and processing notes', priority: 'high' },
    { id: 'action_check_denial', type: 'task', title: 'Review denial reason codes', description: 'Look up specific denial code and resolution steps', priority: 'high' },
    { id: 'action_send_status', type: 'email', title: 'Send claim status update', description: 'Email provider with current claim information', priority: 'medium' },
    { id: 'action_initiate_adjustment', type: 'task', title: 'Initiate claim adjustment', description: 'Submit adjustment request if needed', priority: 'medium' },
  ],
  cat_eligibility: [
    { id: 'action_verify_elig', type: 'task', title: 'Verify member eligibility', description: 'Check current eligibility status and effective dates', priority: 'high' },
    { id: 'action_check_cob', type: 'task', title: 'Check coordination of benefits', description: 'Review primary/secondary insurance information', priority: 'medium' },
    { id: 'action_send_elig', type: 'email', title: 'Send eligibility confirmation', description: 'Email provider with eligibility details', priority: 'medium' },
  ],
  cat_prior_auth: [
    { id: 'action_check_auth', type: 'task', title: 'Check authorization status', description: 'Review current auth status and any pending requirements', priority: 'high' },
    { id: 'action_request_docs', type: 'email', title: 'Request missing documentation', description: 'Send list of required clinical documentation', priority: 'high' },
    { id: 'action_escalate_urgent', type: 'escalate', title: 'Escalate for urgent review', description: 'Flag for expedited clinical review if urgent', priority: 'high' },
  ],
  cat_credentialing: [
    { id: 'action_check_cred', type: 'task', title: 'Check credentialing status', description: 'Review application status and pending items', priority: 'high' },
    { id: 'action_request_cred_docs', type: 'email', title: 'Request missing credentials', description: 'Send list of required documents', priority: 'medium' },
    { id: 'action_verify_license', type: 'task', title: 'Verify license status', description: 'Check license in state database', priority: 'medium' },
  ],
  cat_directory: [
    { id: 'action_update_demo', type: 'task', title: 'Update demographics', description: 'Process address/phone/fax changes', priority: 'high' },
    { id: 'action_confirm_update', type: 'email', title: 'Confirm update request', description: 'Send confirmation of submitted changes', priority: 'medium' },
    { id: 'action_verify_directory', type: 'task', title: 'Verify current listing', description: 'Check current directory entry for accuracy', priority: 'low' },
  ],
  cat_portal: [
    { id: 'action_reset_password', type: 'task', title: 'Reset portal password', description: 'Initiate password reset for provider', priority: 'high' },
    { id: 'action_send_instructions', type: 'email', title: 'Send login instructions', description: 'Email portal access guide', priority: 'medium' },
    { id: 'action_check_era', type: 'task', title: 'Check ERA/EFT enrollment', description: 'Verify electronic payment setup status', priority: 'medium' },
  ],
  cat_grievance: [
    { id: 'action_document_grievance', type: 'task', title: 'Document grievance details', description: 'Capture all relevant complaint information', priority: 'high' },
    { id: 'action_escalate_grievance', type: 'escalate', title: 'Escalate to management', description: 'Flag for supervisor review', priority: 'high' },
    { id: 'action_acknowledge_grievance', type: 'email', title: 'Send acknowledgment', description: 'Confirm receipt and provide timeline', priority: 'high' },
  ],
  general: [
    { id: 'action_document', type: 'note', title: 'Document interaction', description: 'Add detailed notes about the conversation', priority: 'high' },
    { id: 'action_followup', type: 'task', title: 'Schedule follow-up', description: 'Set reminder for follow-up contact', priority: 'medium' },
    { id: 'action_close', type: 'close', title: 'Close case if resolved', description: 'Mark case as resolved with disposition', priority: 'low' },
  ],
};

// ============================================================================
// Summary Templates
// ============================================================================

export const SUMMARY_TEMPLATES: Record<string, string[]> = {
  cat_claims: [
    'Provider called regarding claim {{claim_number}} which is currently {{status}}.',
    'Inquiry about payment for services rendered on {{date}}. Claim status: {{status}}.',
    'Follow-up on denied claim. Denial reason: {{denial_reason}}. Provider seeking appeal guidance.',
  ],
  cat_eligibility: [
    'Eligibility verification request for member {{member_id}}. Member is {{elig_status}} effective {{date}}.',
    'COB inquiry - provider needs to confirm primary vs secondary coverage.',
    'Eligibility discrepancy reported - system shows inactive but member has current ID card.',
  ],
  cat_prior_auth: [
    'Authorization status check for {{service}}. Current status: {{auth_status}}.',
    'Urgent auth request for {{procedure}}. Clinical documentation has been submitted.',
    'Appeal for denied authorization. Provider submitted additional medical records.',
  ],
  cat_credentialing: [
    'Credentialing application status check. Application submitted {{date}}, currently in {{status}} phase.',
    'Missing documents for credentialing: {{missing_docs}}.',
    'Recredentialing reminder - expiration date: {{expiry_date}}.',
  ],
  general: [
    'Provider contacted regarding {{topic}}. Issue has been {{resolved/escalated/pending}}.',
    'Follow-up call from previous inquiry. Provider seeking update on case {{case_id}}.',
    'New inquiry received via {{channel}}. Requires {{action_needed}}.',
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getDraftsByCategory(categoryId: string): DraftResponse[] {
  return EMAIL_DRAFTS[categoryId] || EMAIL_DRAFTS.general || [];
}

export function getCallScriptsByCategory(categoryId: string): DraftResponse[] {
  return CALL_SCRIPTS[categoryId] || CALL_SCRIPTS.general || [];
}

export function getSuggestedActionsByCategory(categoryId: string): SuggestedAction[] {
  const categoryActions = SUGGESTED_ACTIONS[categoryId] || [];
  const generalActions = SUGGESTED_ACTIONS.general || [];
  return [...categoryActions, ...generalActions];
}

export function getRandomSummaryTemplate(categoryId: string): string {
  const templates = SUMMARY_TEMPLATES[categoryId] || SUMMARY_TEMPLATES.general || [];
  return templates[Math.floor(Math.random() * templates.length)];
}
