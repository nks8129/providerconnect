'use client';

import React from 'react';
import { useUIStore } from '@/stores/ui-store';
import { CreateCaseModal } from './CreateCaseModal';
import { LogInteractionModal } from './LogInteractionModal';
import { ResolveCaseModal } from './ResolveCaseModal';
import { AssignCaseModal } from './AssignCaseModal';
import { CommandPalette } from './CommandPalette';
import { ApplyTemplateModal } from './ApplyTemplateModal';
import { EditUserModal } from './EditUserModal';
import { EditSLAPolicyModal } from './EditSLAPolicyModal';
import { EventDetailModal } from './EventDetailModal';
import { CreateEventModal } from './CreateEventModal';
import { EmailBlastDetailModal } from './EmailBlastDetailModal';
import { CreateEmailBlastModal } from './CreateEmailBlastModal';
import { TagProviderModal } from './TagProviderModal';

export function ModalContainer() {
  const activeModal = useUIStore((state) => state.activeModal);

  return (
    <>
      {/* Command Palette - always rendered for keyboard shortcut */}
      <CommandPalette />

      {/* Create Case Modal */}
      {activeModal === 'create_case' && (
        <CreateCaseModal />
      )}

      {/* Log Interaction Modal */}
      {activeModal === 'create_interaction' && (
        <LogInteractionModal />
      )}

      {/* Resolve Case Modal */}
      {activeModal === 'resolve_case' && (
        <ResolveCaseModal />
      )}

      {/* Assign Case Modal */}
      {activeModal === 'assign_case' && (
        <AssignCaseModal />
      )}

      {/* Apply Template Modal */}
      {activeModal === 'apply_template' && (
        <ApplyTemplateModal />
      )}

      {/* Edit User Modal */}
      {activeModal === 'edit_user' && (
        <EditUserModal />
      )}

      {/* Edit SLA Policy Modal */}
      {activeModal === 'edit_sla_policy' && (
        <EditSLAPolicyModal />
      )}

      {/* Event Detail Modal */}
      {activeModal === 'event_detail' && (
        <EventDetailModal />
      )}

      {/* Create Event Modal */}
      {activeModal === 'create_event' && (
        <CreateEventModal />
      )}

      {/* Email Blast Detail Modal */}
      {activeModal === 'email_blast_detail' && (
        <EmailBlastDetailModal />
      )}

      {/* Create Email Blast Modal */}
      {activeModal === 'create_outreach' && (
        <CreateEmailBlastModal />
      )}

      {/* Tag Provider to Campaign Modal */}
      {activeModal === 'tag_provider' && (
        <TagProviderModal />
      )}
    </>
  );
}
