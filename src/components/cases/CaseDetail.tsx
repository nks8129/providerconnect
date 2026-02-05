'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  FileText,
  CheckSquare,
  Paperclip,
  Target,
  MoreHorizontal,
  Play,
  Pause,
  UserPlus,
  Send,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useCasesStore } from '@/stores/cases-store';
import { useProvidersStore } from '@/stores/providers-store';
import { useInteractionsStore } from '@/stores/interactions-store';
import { useAppStore } from '@/stores/app-store';
import { getSLAState, getTimeRemaining, getSLAPercentageUsed } from '@/lib/sla';
import { CATEGORIES } from '@/data/categories';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Case } from '@/types';

interface CaseDetailProps {
  caseData: Case;
}

export function CaseDetail({ caseData }: CaseDetailProps) {
  const { providers } = useProvidersStore();
  const { users, getAuditEventsForEntity, currentUser } = useAppStore();
  const { getInteractionsByCase } = useInteractionsStore();
  const { updateStatus, assignCase, pauseSLA, resumeSLA, addTask, completeTask } = useCasesStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const provider = providers.find((p) => p.id === caseData.providerId);
  const assignee = users.find((u) => u.id === caseData.assigneeId);
  const category = CATEGORIES.find((c) => c.id === caseData.category);
  const slaState = getSLAState(caseData);
  const timeRemaining = getTimeRemaining(caseData);
  const slaPercentage = getSLAPercentageUsed(caseData);
  const auditEvents = getAuditEventsForEntity('case', caseData.id);
  const interactions = getInteractionsByCase(caseData.id);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(caseData.id, newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  const handleAutoAssign = () => {
    // Simulate auto-assignment
    const availableUsers = users.filter(
      (u) => u.role === 'specialist' && u.skills.includes(caseData.category)
    );
    if (availableUsers.length > 0) {
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      assignCase(caseData.id, randomUser.id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-mono text-primary-600">{caseData.id}</span>
              <Badge variant={caseData.status as any}>{caseData.status.replace('_', ' ')}</Badge>
              <Badge variant={caseData.priority as any}>{caseData.priority}</Badge>
              <Badge variant="outline">{caseData.channel}</Badge>
            </div>
            <h1 className="text-lg font-semibold text-slate-900 mt-2">{caseData.title}</h1>
          </div>

          {/* SLA Indicator */}
          {caseData.status !== 'resolved' && caseData.status !== 'closed' && (
            <div
              className={cn(
                'px-4 py-2 rounded-lg text-center shrink-0',
                slaState === 'on_track' && 'bg-green-50 border border-green-200',
                slaState === 'at_risk' && 'bg-yellow-50 border border-yellow-200',
                slaState === 'breached' && 'bg-red-50 border border-red-200'
              )}
            >
              <p
                className={cn(
                  'text-lg font-bold',
                  slaState === 'on_track' && 'text-green-700',
                  slaState === 'at_risk' && 'text-yellow-700',
                  slaState === 'breached' && 'text-red-700'
                )}
              >
                {timeRemaining.formatted}
              </p>
              <p className="text-xs text-slate-500">SLA {slaState.replace('_', ' ')}</p>
            </div>
          )}
        </div>

        {/* Assignee and Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{getInitials(assignee.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{assignee.name}</p>
                  <p className="text-xs text-slate-500">Assigned</p>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleAutoAssign}>
                <UserPlus className="w-4 h-4 mr-2" />
                Auto-Assign
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Reassign
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {users
                  .filter((u) => u.role === 'specialist')
                  .map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => assignCase(caseData.id, user.id)}
                    >
                      {user.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Log Interaction
            </Button>
            <Button variant="outline" size="sm">
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            {caseData.sla.pausedAt ? (
              <Button variant="outline" size="sm" onClick={() => resumeSLA(caseData.id)}>
                <Play className="w-4 h-4 mr-2" />
                Resume SLA
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => pauseSLA(caseData.id, 'Waiting on Provider')}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause SLA
              </Button>
            )}
            <Button variant="success" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Resolve
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateStatus(caseData.id, 'closed')}>
                  Close Case
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Delete Case</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Provider Mini-Card */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{provider?.name || 'Unknown Provider'}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>NPI: {provider?.npi}</span>
                <span>•</span>
                <span>Tax ID: {provider?.taxId}</span>
              </div>
            </div>
          </div>
          {provider && (
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {provider.contacts[0] && (
                <>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {provider.contacts[0].phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {provider.contacts[0].email}
                  </div>
                </>
              )}
              {provider.addresses[0] && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {provider.addresses[0].city}, {provider.addresses[0].state}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 border-b border-slate-200 bg-white">
          <TabsList className="bg-transparent h-12 p-0 gap-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              <FileText className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              <Clock className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="interactions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              <MessageSquare className="w-4 h-4 mr-2" />
              Interactions ({interactions.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks ({caseData.tasks.length})
            </TabsTrigger>
            <TabsTrigger value="resolution" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              <Target className="w-4 h-4 mr-2" />
              Resolution
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Case Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Category</p>
                      <p className="text-sm font-medium">{category?.name || caseData.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Subcategory</p>
                      <p className="text-sm font-medium">
                        {category?.subcategories.find((s) => s.id === caseData.subcategory)?.name ||
                          caseData.subcategory}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Line of Business</p>
                      <p className="text-sm font-medium">{caseData.lob.replace('lob_', '')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Channel</p>
                      <p className="text-sm font-medium capitalize">{caseData.channel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Created</p>
                      <p className="text-sm font-medium">
                        {format(new Date(caseData.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Last Updated</p>
                      <p className="text-sm font-medium">
                        {formatDistanceToNow(new Date(caseData.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Summary</p>
                    <p className="text-sm">{caseData.summary}</p>
                  </div>

                  {caseData.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {caseData.tags.map((tag) => (
                            <Badge key={tag} variant="outline" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* SLA Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">SLA Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Due Date</span>
                      <span className="font-medium">
                        {format(new Date(caseData.sla.dueAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all',
                          slaState === 'on_track' && 'bg-green-500',
                          slaState === 'at_risk' && 'bg-yellow-500',
                          slaState === 'breached' && 'bg-red-500'
                        )}
                        style={{ width: `${Math.min(slaPercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {slaPercentage.toFixed(0)}% of SLA time used
                      {caseData.sla.pausedAt && ' (paused)'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-0">
              <div className="space-y-4">
                {auditEvents.slice(0, 20).map((event) => {
                  const actor = users.find((u) => u.id === event.actorId);
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{actor?.name || 'System'}</span>{' '}
                          {event.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {auditEvents.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">No activity yet</p>
                )}
              </div>
            </TabsContent>

            {/* Interactions Tab */}
            <TabsContent value="interactions" className="mt-0">
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <Card key={interaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              interaction.type === 'call' && 'bg-blue-100',
                              interaction.type === 'email' && 'bg-green-100'
                            )}
                          >
                            {interaction.type === 'call' ? (
                              <Phone className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Mail className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {interaction.direction} {interaction.type}
                            </p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(interaction.occurredAt), 'MMM d, yyyy h:mm a')}
                              {interaction.duration > 0 && ` • ${interaction.duration} min`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={interaction.sentiment as any} size="sm">
                          {interaction.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm mt-3">{interaction.summary}</p>
                    </CardContent>
                  </Card>
                ))}
                {interactions.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                    <p className="text-sm text-slate-500">No interactions linked to this case</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Log Interaction
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-0">
              <div className="space-y-3">
                {/* Add Task */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                  <Button onClick={handleAddTask}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Task List */}
                {caseData.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border',
                      task.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
                    )}
                  >
                    <button
                      onClick={() => !task.completed && completeTask(caseData.id, task.id)}
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-slate-300 hover:border-primary-500'
                      )}
                    >
                      {task.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span
                      className={cn(
                        'text-sm flex-1',
                        task.completed && 'line-through text-slate-400'
                      )}
                    >
                      {task.title}
                    </span>
                    {task.completed && task.completedAt && (
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                ))}

                {caseData.tasks.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No tasks yet</p>
                )}
              </div>
            </TabsContent>

            {/* Resolution Tab */}
            <TabsContent value="resolution" className="mt-0">
              {caseData.resolution.resolvedAt ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Case Resolved
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Root Cause</p>
                        <p className="text-sm font-medium">{caseData.resolution.rootCause || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Disposition</p>
                        <p className="text-sm font-medium">{caseData.resolution.disposition || 'Not specified'}</p>
                      </div>
                    </div>
                    {caseData.resolution.summary && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Resolution Summary</p>
                        <p className="text-sm">{caseData.resolution.summary}</p>
                      </div>
                    )}
                    {caseData.resolution.prevention && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Prevention Recommendation</p>
                        <p className="text-sm">{caseData.resolution.prevention}</p>
                      </div>
                    )}
                    <div className="text-xs text-slate-500">
                      Resolved {formatDistanceToNow(new Date(caseData.resolution.resolvedAt), { addSuffix: true })}
                      {caseData.resolution.resolvedBy && (
                        <> by {users.find((u) => u.id === caseData.resolution.resolvedBy)?.name}</>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm text-slate-500 mb-4">Case not yet resolved</p>
                  <Button>
                    <Check className="w-4 h-4 mr-2" />
                    Resolve Case
                  </Button>
                </div>
              )}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
