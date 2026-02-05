// ============================================================================
// Seed Data Generator
// Generates realistic demo data for the Provider Interaction & Inquiry Hub
// ============================================================================

import {
  format,
  subDays,
  subHours,
  addHours,
  subMinutes,
} from 'date-fns';
import type {
  User,
  Team,
  Provider,
  Case,
  Interaction,
  AuditEvent,
  OutreachEvent,
  EmailBlast,
  KnowledgeArticle,
  Address,
  Contact,
  CaseStatus,
  CasePriority,
  CaseChannel,
  InteractionType,
  Sentiment,
  SLAPolicy,
} from '@/types';
import {
  generateId,
  generateCaseId,
  generateNPI,
  generateTaxId,
  pickRandom,
  pickRandomN,
  randomBetween,
} from './utils';
import { CATEGORIES, LINES_OF_BUSINESS, SPECIALTIES, US_STATES } from '@/data/categories';
import { DEFAULT_SLA_HOURS } from './sla';

// ============================================================================
// Name and Data Pools
// ============================================================================

const FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica',
  'Sarah', 'Karen', 'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley',
  'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
];

const PRACTICE_NAMES = [
  'Medical Associates', 'Family Practice', 'Healthcare Partners', 'Wellness Center',
  'Medical Group', 'Health Clinic', 'Care Center', 'Medical Clinic', 'Health Partners',
  'Community Health', 'Premier Care', 'Advanced Medical', 'Complete Care',
];

const FACILITY_NAMES = [
  'Regional Medical Center', 'Community Hospital', 'Healthcare System', 'Medical Center',
  'General Hospital', 'University Medical', 'Memorial Hospital', 'Health System',
];

const STREET_NAMES = [
  'Main St', 'Oak Ave', 'Medical Dr', 'Healthcare Blvd', 'Park Rd', 'Center St',
  'First Ave', 'Second St', 'Third Ave', 'Hospital Way', 'Clinic Rd', 'Wellness Dr',
];

const CITIES: Record<string, string[]> = {
  CA: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
  TX: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
  FL: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
  NY: ['New York', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
  IL: ['Chicago', 'Aurora', 'Naperville', 'Rockford', 'Springfield'],
};

const CASE_TITLES: Record<string, string[]> = {
  cat_claims: [
    'Claim denied - need explanation',
    'Payment not received for claim',
    'Remittance shows incorrect amount',
    'Claim status inquiry',
    'Resubmission guidance needed',
    'EOB not matching expected payment',
    'Multiple claims pending for same patient',
  ],
  cat_eligibility: [
    'Member eligibility verification needed',
    'Coverage terminated but patient has card',
    'COB question - primary vs secondary',
    'Effective date discrepancy',
    'Dependent eligibility question',
  ],
  cat_prior_auth: [
    'Authorization status check',
    'Urgent auth needed for surgery',
    'Missing information for auth request',
    'Auth denied - appeal guidance',
    'Retroactive auth request',
  ],
  cat_credentialing: [
    'Application status inquiry',
    'Missing documents notification',
    'Recredentialing upcoming',
    'License update submission',
    'New provider onboarding',
  ],
  cat_contracting: [
    'Network participation question',
    'Fee schedule request',
    'Contract renewal inquiry',
    'Rate review request',
    'New location participation',
  ],
  cat_directory: [
    'Address update needed',
    'Phone number change',
    'New provider to add to roster',
    'Incorrect specialty listed',
    'Remove terminated provider',
  ],
  cat_portal: [
    'Cannot log into portal',
    'Password reset needed',
    'ERA enrollment request',
    'EFT setup assistance',
    'Portal showing errors',
  ],
  cat_grievance: [
    'Complaint about claim processing',
    'Grievance - delayed authorization',
    'Appeal support needed',
    'Escalation request',
    'Formal complaint submission',
  ],
};

const INTERACTION_SUMMARIES: Record<string, string[]> = {
  call: [
    'Provider called regarding {{topic}}. Verified identity and discussed issue.',
    'Inbound call from office manager about {{topic}}. Provided guidance.',
    'Follow-up call about previous inquiry. Updated provider on status.',
    'Provider called frustrated about {{topic}}. Addressed concerns and provided resolution.',
    'Quick call to verify {{topic}}. Information confirmed.',
  ],
  email: [
    'Email received regarding {{topic}}. Reviewing and will respond.',
    'Follow-up email about pending case. Provider seeking update.',
    'Documentation received via email for {{topic}}.',
    'Provider email requesting status on multiple items.',
  ],
};

// ============================================================================
// Generator Functions
// ============================================================================

function generateUsers(): User[] {
  const users: User[] = [];

  // Create 8 specialists across teams
  const specialists = [
    { name: 'Alex Thompson', team: 'team_claims', skills: ['cat_claims', 'cat_eligibility'] },
    { name: 'Jordan Rivera', team: 'team_claims', skills: ['cat_claims'] },
    { name: 'Sam Chen', team: 'team_eligibility', skills: ['cat_eligibility', 'cat_prior_auth'] },
    { name: 'Morgan Davis', team: 'team_um', skills: ['cat_prior_auth'] },
    { name: 'Casey Williams', team: 'team_credentialing', skills: ['cat_credentialing', 'cat_contracting'] },
    { name: 'Taylor Brown', team: 'team_data', skills: ['cat_directory', 'cat_portal'] },
    { name: 'Riley Martinez', team: 'team_technical', skills: ['cat_portal'] },
    { name: 'Jamie Anderson', team: 'team_appeals', skills: ['cat_grievance'] },
  ];

  specialists.forEach((spec, idx) => {
    users.push({
      id: `user_${idx + 1}`,
      name: spec.name,
      email: `${spec.name.toLowerCase().replace(' ', '.')}@healthplan.com`,
      role: 'specialist',
      team: spec.team,
      capacity: 25,
      skills: spec.skills,
      isActive: true,
      createdAt: subDays(new Date(), 365).toISOString(),
    });
  });

  // Add team leads
  const leads = [
    { name: 'Chris Johnson', team: 'team_claims' },
    { name: 'Pat Williams', team: 'team_um' },
  ];

  leads.forEach((lead, idx) => {
    users.push({
      id: `user_lead_${idx + 1}`,
      name: lead.name,
      email: `${lead.name.toLowerCase().replace(' ', '.')}@healthplan.com`,
      role: 'lead',
      team: lead.team,
      capacity: 15,
      skills: CATEGORIES.map(c => c.id),
      isActive: true,
      createdAt: subDays(new Date(), 500).toISOString(),
    });
  });

  // Add managers
  users.push({
    id: 'user_manager_1',
    name: 'Dana Wilson',
    email: 'dana.wilson@healthplan.com',
    role: 'manager',
    team: 'team_management',
    capacity: 5,
    skills: CATEGORIES.map(c => c.id),
    isActive: true,
    createdAt: subDays(new Date(), 730).toISOString(),
  });

  return users;
}

function generateTeams(): Team[] {
  return [
    {
      id: 'team_claims',
      name: 'Claims Team',
      description: 'Handles claims and payment inquiries',
      leadId: 'user_lead_1',
      memberIds: ['user_1', 'user_2'],
      categories: ['cat_claims'],
      assignmentRule: 'least_loaded',
    },
    {
      id: 'team_eligibility',
      name: 'Eligibility Team',
      description: 'Handles eligibility and benefits questions',
      leadId: 'user_lead_1',
      memberIds: ['user_3'],
      categories: ['cat_eligibility'],
      assignmentRule: 'round_robin',
    },
    {
      id: 'team_um',
      name: 'Utilization Management',
      description: 'Handles prior authorization inquiries',
      leadId: 'user_lead_2',
      memberIds: ['user_4'],
      categories: ['cat_prior_auth'],
      assignmentRule: 'least_loaded',
    },
    {
      id: 'team_credentialing',
      name: 'Credentialing Team',
      description: 'Handles credentialing and contracting',
      leadId: 'user_lead_2',
      memberIds: ['user_5'],
      categories: ['cat_credentialing', 'cat_contracting'],
      assignmentRule: 'round_robin',
    },
    {
      id: 'team_data',
      name: 'Provider Data Team',
      description: 'Handles directory updates',
      leadId: 'user_lead_1',
      memberIds: ['user_6'],
      categories: ['cat_directory'],
      assignmentRule: 'round_robin',
    },
    {
      id: 'team_technical',
      name: 'Technical Support',
      description: 'Handles portal and EDI issues',
      leadId: 'user_lead_2',
      memberIds: ['user_7'],
      categories: ['cat_portal'],
      assignmentRule: 'least_loaded',
    },
    {
      id: 'team_appeals',
      name: 'Appeals & Grievances',
      description: 'Handles grievances and appeals',
      leadId: 'user_lead_2',
      memberIds: ['user_8'],
      categories: ['cat_grievance'],
      assignmentRule: 'manual',
    },
  ];
}

function generateAddress(state: string): Address {
  const cities = CITIES[state] || CITIES['CA'];
  return {
    id: generateId('addr'),
    type: pickRandom(['practice', 'billing', 'mailing']),
    street1: `${randomBetween(100, 9999)} ${pickRandom(STREET_NAMES)}`,
    street2: Math.random() > 0.7 ? `Suite ${randomBetween(100, 999)}` : undefined,
    city: pickRandom(cities),
    state: state,
    zip: `${randomBetween(10000, 99999)}`,
    isPrimary: true,
  };
}

function generateContact(): Contact {
  return {
    id: generateId('contact'),
    name: `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`,
    role: pickRandom(['Office Manager', 'Billing Manager', 'Practice Administrator', 'Front Desk']),
    phone: `(${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}`,
    email: `contact${randomBetween(1, 999)}@practice.com`,
    isPrimary: true,
  };
}

function generateProviders(count: number): Provider[] {
  const providers: Provider[] = [];

  for (let i = 0; i < count; i++) {
    const type = pickRandom(['individual', 'individual', 'individual', 'group', 'facility']) as Provider['type'];
    const state = pickRandom(US_STATES).code;
    const specialties = pickRandomN(SPECIALTIES, randomBetween(1, 3)).map(s => s.id);
    const lobs = pickRandomN(LINES_OF_BUSINESS, randomBetween(1, 3)).map(l => l.id);

    let name: string;
    if (type === 'individual') {
      name = `Dr. ${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
    } else if (type === 'group') {
      name = `${pickRandom(LAST_NAMES)} ${pickRandom(PRACTICE_NAMES)}`;
    } else {
      name = `${pickRandom(CITIES[state] || ['Metro'])} ${pickRandom(FACILITY_NAMES)}`;
    }

    const createdAt = subDays(new Date(), randomBetween(30, 730)).toISOString();

    providers.push({
      id: `prov_${i + 1}`,
      name,
      type,
      npi: generateNPI(),
      taxId: generateTaxId(),
      specialties,
      addresses: [generateAddress(state)],
      contacts: [generateContact()],
      lobs,
      networkStatus: pickRandom(['active', 'active', 'active', 'active', 'pending', 'terminated']),
      credentialingStatus: pickRandom(['current', 'current', 'current', 'pending', 'expired']),
      tags: [],
      notes: '',
      createdAt,
      updatedAt: createdAt,
    });
  }

  return providers;
}

function generateCases(count: number, providers: Provider[], users: User[]): Case[] {
  const cases: Case[] = [];
  const specialists = users.filter(u => u.role === 'specialist');
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const provider = pickRandom(providers);
    const category = pickRandom(CATEGORIES);
    const subcategory = pickRandom(category.subcategories);
    const lob = pickRandom(provider.lobs) || pickRandom(LINES_OF_BUSINESS).id;
    const priority = pickRandom(['low', 'medium', 'medium', 'high', 'urgent']) as CasePriority;
    const channel = pickRandom(['phone', 'phone', 'email', 'portal', 'fax']) as CaseChannel;

    // Status distribution: some open, some resolved
    const statusOptions: CaseStatus[] = [
      'open', 'open', 'in_progress', 'in_progress', 'in_progress',
      'pending_provider', 'resolved', 'resolved', 'resolved', 'closed'
    ];
    const status = pickRandom(statusOptions);

    // Create date - range from 60 days ago to now
    const daysAgo = randomBetween(0, 60);
    const createdAt = subDays(now, daysAgo);

    // SLA calculation
    const slaHours = category.slaHours[priority] || DEFAULT_SLA_HOURS[priority];
    const dueAt = addHours(createdAt, slaHours);

    // Assignee - most cases are assigned
    const assigneeId = Math.random() > 0.1 ? pickRandom(specialists).id : null;

    // Resolution for resolved/closed cases
    const isResolved = status === 'resolved' || status === 'closed';

    const titles = CASE_TITLES[category.id] || CASE_TITLES.cat_claims;

    cases.push({
      id: generateCaseId(),
      providerId: provider.id,
      title: pickRandom(titles),
      status,
      priority,
      category: category.id,
      subcategory: subcategory.id,
      lob,
      channel,
      summary: `Provider inquiry regarding ${category.name.toLowerCase()} - ${subcategory.name}`,
      assigneeId,
      teamId: category.defaultTeamId,
      sla: {
        dueAt: dueAt.toISOString(),
        pausedAt: status === 'pending_provider' ? subHours(now, randomBetween(1, 24)).toISOString() : null,
        pauseReason: status === 'pending_provider' ? 'Waiting on Provider' : null,
        totalPausedTime: 0,
      },
      resolution: {
        rootCause: isResolved ? pickRandom(['rc_data_error', 'rc_process_gap', 'rc_no_issue', 'rc_provider_error']) : null,
        disposition: isResolved ? pickRandom(['disp_resolved', 'disp_info_provided']) : null,
        summary: isResolved ? 'Issue was investigated and resolved. Provider has been notified.' : null,
        prevention: isResolved ? 'Recommended verification steps to prevent recurrence.' : null,
        resolvedAt: isResolved ? subDays(now, randomBetween(0, daysAgo)).toISOString() : null,
        resolvedBy: isResolved ? assigneeId : null,
      },
      tasks: [
        {
          id: generateId('task'),
          title: 'Verify provider information',
          completed: isResolved || Math.random() > 0.5,
          completedAt: isResolved ? subDays(now, randomBetween(0, daysAgo)).toISOString() : null,
          completedBy: assigneeId,
          createdAt: createdAt.toISOString(),
        },
        {
          id: generateId('task'),
          title: `Review ${category.name.toLowerCase()} details`,
          completed: isResolved || Math.random() > 0.6,
          completedAt: isResolved ? subDays(now, randomBetween(0, daysAgo)).toISOString() : null,
          completedBy: assigneeId,
          createdAt: createdAt.toISOString(),
        },
      ],
      attachments: [],
      tags: Math.random() > 0.7 ? ['follow-up-needed'] : [],
      createdAt: createdAt.toISOString(),
      updatedAt: subDays(now, randomBetween(0, daysAgo)).toISOString(),
      createdBy: pickRandom(specialists).id,
    });
  }

  return cases;
}

function generateInteractions(
  count: number,
  providers: Provider[],
  cases: Case[],
  users: User[]
): Interaction[] {
  const interactions: Interaction[] = [];
  const specialists = users.filter(u => u.role === 'specialist');
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const provider = pickRandom(providers);
    const relatedCases = cases.filter(c => c.providerId === provider.id);
    const caseId = relatedCases.length > 0 && Math.random() > 0.3
      ? pickRandom(relatedCases).id
      : null;

    const type = pickRandom(['call', 'call', 'call', 'email', 'email', 'meeting']) as InteractionType;
    const direction = pickRandom(['inbound', 'inbound', 'inbound', 'outbound']) as Interaction['direction'];
    const sentiment = pickRandom(['positive', 'neutral', 'neutral', 'neutral', 'negative', 'frustrated']) as Sentiment;

    const daysAgo = randomBetween(0, 90);
    const occurredAt = subDays(now, daysAgo);

    const category = caseId
      ? CATEGORIES.find(c => c.id === cases.find(cs => cs.id === caseId)?.category)
      : pickRandom(CATEGORIES);

    const summaryTemplates = INTERACTION_SUMMARIES[type] || INTERACTION_SUMMARIES.call;
    const summary = pickRandom(summaryTemplates).replace('{{topic}}', category?.name.toLowerCase() || 'inquiry');

    interactions.push({
      id: generateId('int'),
      providerId: provider.id,
      caseId,
      type,
      direction,
      channel: type === 'call' ? 'phone' : type,
      occurredAt: occurredAt.toISOString(),
      duration: type === 'call' ? randomBetween(2, 30) : randomBetween(1, 5),
      participants: [provider.contacts[0]?.name || 'Office Staff'],
      summary,
      notes: `Detailed notes about the ${type} interaction regarding ${category?.name || 'general inquiry'}.`,
      structuredNotes: type === 'call' ? {
        reason: category?.name || 'General Inquiry',
        providerReported: 'Provider reported needing assistance with their inquiry.',
        whatWeChecked: 'Verified provider information and reviewed relevant records.',
        whatWeAdvised: 'Provided guidance and next steps.',
        followUp: Math.random() > 0.5 ? 'Follow up in 2-3 business days' : '',
        followUpOwner: Math.random() > 0.5 ? pickRandom(specialists).id : null,
        followUpDueDate: Math.random() > 0.5 ? addHours(occurredAt, 72).toISOString() : null,
      } : null,
      sentiment,
      attachments: [],
      createdBy: pickRandom(specialists).id,
      createdAt: occurredAt.toISOString(),
    });
  }

  return interactions;
}

function generateAuditEvents(cases: Case[], interactions: Interaction[], users: User[]): AuditEvent[] {
  const events: AuditEvent[] = [];
  const specialists = users.filter(u => u.role === 'specialist');

  // Generate audit events for cases
  cases.forEach(caseData => {
    // Case created event
    events.push({
      id: generateId('audit'),
      entityType: 'case',
      entityId: caseData.id,
      action: 'created',
      actorId: caseData.createdBy,
      timestamp: caseData.createdAt,
      metadata: { category: caseData.category, priority: caseData.priority },
      description: `Case created: ${caseData.title}`,
    });

    // Assignment event
    if (caseData.assigneeId) {
      events.push({
        id: generateId('audit'),
        entityType: 'case',
        entityId: caseData.id,
        action: 'assigned',
        actorId: pickRandom(specialists).id,
        timestamp: addHours(new Date(caseData.createdAt), randomBetween(0, 4)).toISOString(),
        metadata: { assigneeId: caseData.assigneeId },
        description: `Case assigned to ${users.find(u => u.id === caseData.assigneeId)?.name || 'team member'}`,
      });
    }

    // Status changes for resolved cases
    if (caseData.status === 'resolved' || caseData.status === 'closed') {
      events.push({
        id: generateId('audit'),
        entityType: 'case',
        entityId: caseData.id,
        action: 'resolved',
        actorId: caseData.resolution.resolvedBy || caseData.assigneeId || pickRandom(specialists).id,
        timestamp: caseData.resolution.resolvedAt || caseData.updatedAt,
        metadata: { disposition: caseData.resolution.disposition },
        description: 'Case resolved',
      });
    }
  });

  // Generate audit events for interactions
  interactions.forEach(interaction => {
    events.push({
      id: generateId('audit'),
      entityType: 'interaction',
      entityId: interaction.id,
      action: 'created',
      actorId: interaction.createdBy,
      timestamp: interaction.createdAt,
      metadata: { type: interaction.type, caseId: interaction.caseId },
      description: `${interaction.type} interaction logged`,
    });
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateOutreachEvents(providers: Provider[]): OutreachEvent[] {
  const events: OutreachEvent[] = [];
  const now = new Date();

  const topics = [
    'Claims Submission Best Practices',
    'Prior Authorization Updates',
    'Portal Training Session',
    'Credentialing Requirements Overview',
    'Network Updates and Changes',
    'EDI/ERA Enrollment Workshop',
    'Quality Metrics Review',
    'Contract Updates Information Session',
    'Provider Directory Maintenance',
    'New Year Policy Changes',
  ];

  for (let i = 0; i < 20; i++) {
    const daysOffset = randomBetween(-30, 30); // Some in past, some in future
    const eventDate = subDays(now, daysOffset);
    const attendees = pickRandomN(providers, randomBetween(5, 25)).map(p => p.id);
    const lob = pickRandom(LINES_OF_BUSINESS).id;

    events.push({
      id: generateId('outreach'),
      type: pickRandom(['webinar', 'workshop', 'training']),
      title: pickRandom(topics),
      topic: pickRandom(CATEGORIES).name,
      description: 'Educational session for network providers covering important updates and best practices.',
      lob,
      audienceSegment: `${pickRandom(SPECIALTIES).name} providers`,
      date: eventDate.toISOString(),
      duration: randomBetween(30, 120),
      attendeeIds: daysOffset > 0 ? [] : attendees, // Future events have no attendees yet
      notes: daysOffset > 0 ? '' : 'Session completed successfully. Good provider engagement.',
      followUpActions: daysOffset > 0 ? [] : ['Send follow-up materials', 'Schedule Q&A session'],
      createdBy: 'user_manager_1',
      createdAt: subDays(eventDate, 14).toISOString(),
      updatedAt: eventDate.toISOString(),
    });
  }

  return events;
}

function generateEmailBlasts(providers: Provider[]): EmailBlast[] {
  const blasts: EmailBlast[] = [];
  const now = new Date();

  const subjects = [
    'Important: Claims Submission Deadline Reminder',
    'New Portal Features Now Available',
    'Credentialing Reminder: Documents Due Soon',
    'Network Bulletin: Policy Updates',
    'Provider Newsletter - Monthly Update',
    'Action Required: Update Your Practice Information',
    'Upcoming Training Opportunities',
    'Quality Improvement Initiative',
  ];

  for (let i = 0; i < 15; i++) {
    const sentAt = subDays(now, randomBetween(1, 60));
    const recipients = pickRandomN(providers, randomBetween(30, 50));
    const recipientCount = recipients.length;
    const openRate = randomBetween(20, 60) / 100;
    const clickRate = randomBetween(5, 25) / 100;

    blasts.push({
      id: generateId('blast'),
      title: `Blast: ${pickRandom(subjects).split(':')[0]}`,
      subject: pickRandom(subjects),
      content: 'Email content with important information for providers...',
      audienceSegment: 'All Network Providers',
      lob: pickRandom(LINES_OF_BUSINESS).id,
      sentAt: sentAt.toISOString(),
      recipientIds: recipients.map(p => p.id),
      recipientCount,
      metrics: {
        opens: Math.floor(recipientCount * openRate),
        clicks: Math.floor(recipientCount * clickRate),
        bounces: Math.floor(recipientCount * 0.02),
        unsubscribes: Math.floor(recipientCount * 0.005),
      },
      createdBy: 'user_manager_1',
      createdAt: subDays(sentAt, 3).toISOString(),
    });
  }

  return blasts;
}

function generateKnowledgeArticles(): KnowledgeArticle[] {
  const articles: KnowledgeArticle[] = [];

  const articleData = [
    { title: 'How to Submit a Clean Claim', category: 'cat_claims', checklist: ['Verify member eligibility', 'Include all required fields', 'Attach supporting documentation', 'Use correct billing codes'] },
    { title: 'Understanding Denial Codes', category: 'cat_claims', checklist: ['Identify denial reason code', 'Review claim details', 'Gather supporting documentation', 'Submit corrected claim or appeal'] },
    { title: 'Prior Authorization Request Guide', category: 'cat_prior_auth', checklist: ['Verify authorization is required', 'Complete auth request form', 'Include clinical documentation', 'Submit via portal or fax'] },
    { title: 'Credentialing Application Checklist', category: 'cat_credentialing', checklist: ['Complete CAQH profile', 'Verify license is current', 'Submit required documents', 'Sign attestation forms'] },
    { title: 'Provider Portal User Guide', category: 'cat_portal', checklist: ['Register for portal access', 'Set up two-factor authentication', 'Complete profile setup', 'Explore available features'] },
    { title: 'ERA/EFT Enrollment Steps', category: 'cat_portal', checklist: ['Log into provider portal', 'Navigate to payment settings', 'Complete enrollment form', 'Verify banking information'] },
    { title: 'Directory Update Process', category: 'cat_directory', checklist: ['Log into provider portal', 'Navigate to practice information', 'Update required fields', 'Submit for processing'] },
    { title: 'Filing a Provider Grievance', category: 'cat_grievance', checklist: ['Document the issue', 'Gather supporting evidence', 'Complete grievance form', 'Submit within 60 days'] },
    { title: 'Appeals Process Overview', category: 'cat_grievance', checklist: ['Identify appeal type', 'Gather supporting documentation', 'Write appeal letter', 'Submit before deadline'] },
    { title: 'Eligibility Verification Best Practices', category: 'cat_eligibility', checklist: ['Verify at time of service', 'Check effective dates', 'Confirm benefits', 'Document verification'] },
  ];

  articleData.forEach((data, idx) => {
    articles.push({
      id: generateId('article'),
      title: data.title,
      category: data.category,
      content: `# ${data.title}\n\nThis article provides guidance on ${data.title.toLowerCase()}.\n\n## Overview\n\nDetailed information about the process and requirements.\n\n## Steps\n\n${data.checklist.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n## Additional Resources\n\nContact Provider Relations for additional assistance.`,
      checklist: data.checklist,
      relatedArticleIds: [],
      tags: [data.category.replace('cat_', '')],
      viewCount: randomBetween(50, 500),
      helpfulCount: randomBetween(10, 100),
      createdBy: 'user_manager_1',
      createdAt: subDays(new Date(), randomBetween(30, 365)).toISOString(),
      updatedAt: subDays(new Date(), randomBetween(1, 30)).toISOString(),
    });
  });

  return articles;
}

function generateSLAPolicies(): SLAPolicy[] {
  const policies: SLAPolicy[] = [];

  CATEGORIES.forEach(category => {
    (['urgent', 'high', 'medium', 'low'] as CasePriority[]).forEach(priority => {
      policies.push({
        id: generateId('sla'),
        name: `${category.name} - ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`,
        category: category.id,
        priority,
        targetHours: category.slaHours[priority],
        warningThreshold: 75,
        allowPause: true,
        pauseReasons: ['Waiting on Provider', 'Waiting on Member', 'Waiting on Vendor', 'Escalated'],
        isActive: true,
      });
    });
  });

  return policies;
}

// ============================================================================
// Main Seed Function
// ============================================================================

export interface SeedData {
  users: User[];
  teams: Team[];
  providers: Provider[];
  cases: Case[];
  interactions: Interaction[];
  auditEvents: AuditEvent[];
  outreachEvents: OutreachEvent[];
  emailBlasts: EmailBlast[];
  knowledgeArticles: KnowledgeArticle[];
  slaPolicies: SLAPolicy[];
}

export function generateSeedData(): SeedData {
  console.log('Generating seed data...');

  const users = generateUsers();
  const teams = generateTeams();
  const providers = generateProviders(60);
  const cases = generateCases(250, providers, users);
  const interactions = generateInteractions(900, providers, cases, users);
  const auditEvents = generateAuditEvents(cases, interactions, users);
  const outreachEvents = generateOutreachEvents(providers);
  const emailBlasts = generateEmailBlasts(providers);
  const knowledgeArticles = generateKnowledgeArticles();
  const slaPolicies = generateSLAPolicies();

  console.log(`Generated: ${users.length} users, ${providers.length} providers, ${cases.length} cases, ${interactions.length} interactions`);

  return {
    users,
    teams,
    providers,
    cases,
    interactions,
    auditEvents,
    outreachEvents,
    emailBlasts,
    knowledgeArticles,
    slaPolicies,
  };
}
