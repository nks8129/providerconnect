'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Zap, User } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useCasesStore } from '@/stores/cases-store';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

export function AssignCaseModal() {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();
  const { getCase, assignCase } = useCasesStore();
  const { users, teams, currentUser } = useAppStore();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const isOpen = activeModal === 'assign_case';
  const caseId = modalData?.caseId as string;
  const caseData = caseId ? getCase(caseId) : null;

  // Get team members for this case's team
  const teamMembers = users.filter(u =>
    u.role === 'specialist' || u.role === 'lead'
  );

  const handleClose = () => {
    setSelectedUser(null);
    closeModal();
  };

  const handleAutoAssign = () => {
    // Simple auto-assign logic: find least loaded specialist with matching skills
    const specialists = teamMembers.filter(u => u.role === 'specialist');

    if (specialists.length > 0) {
      // Pick random for demo
      const assignee = specialists[Math.floor(Math.random() * specialists.length)];
      setSelectedUser(assignee.id);
    }
  };

  const handleSubmit = () => {
    if (!caseId || !selectedUser) return;

    assignCase(caseId, selectedUser);

    const assignedUser = users.find(u => u.id === selectedUser);
    addToast({
      type: 'success',
      title: 'Case Assigned',
      message: `Case ${caseId} has been assigned to ${assignedUser?.name || 'team member'}.`,
    });

    handleClose();
  };

  const handleAssignToMe = () => {
    if (!caseId || !currentUser) return;

    assignCase(caseId, currentUser.id);

    addToast({
      type: 'success',
      title: 'Case Assigned',
      message: `Case ${caseId} has been assigned to you.`,
    });

    handleClose();
  };

  if (!caseData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            Assign Case
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Case Info */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-blue-600">{caseData.id}</span>
              <Badge variant={caseData.priority as any} size="sm">{caseData.priority}</Badge>
            </div>
            <p className="text-sm font-medium mt-1">{caseData.title}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleAssignToMe}
            >
              <User className="w-4 h-4 mr-2" />
              Assign to Me
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleAutoAssign}
            >
              <Zap className="w-4 h-4 mr-2" />
              Auto-Assign
            </Button>
          </div>

          {/* Team Members List */}
          <div className="space-y-2">
            <Label>Select Team Member</Label>
            <div className="border rounded-lg divide-y max-h-[250px] overflow-auto">
              {teamMembers.map((user) => {
                const isSelected = selectedUser === user.id;
                const isCurrent = currentUser?.id === user.id;

                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={cn(
                      'w-full p-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3',
                      isSelected && 'bg-blue-50'
                    )}
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className={cn(
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200'
                      )}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {user.name}
                        {isCurrent && <span className="text-slate-400 ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-500">{user.role} • {user.team}</p>
                    </div>
                    {isSelected && (
                      <Badge variant="success" size="sm">Selected</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedUser}>
            Assign Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
