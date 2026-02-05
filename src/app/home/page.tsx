'use client';

import React from 'react';
import Link from 'next/link';
import {
  Inbox,
  User,
  AlertCircle,
  Clock,
  AlertTriangle,
  Timer,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCasesStore } from '@/stores/cases-store';
import { useProvidersStore } from '@/stores/providers-store';
import { useAppStore } from '@/stores/app-store';
import { useUIStore } from '@/stores/ui-store';
import { getSLAState, getTimeRemaining } from '@/lib/sla';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { cases, getStats } = useCasesStore();
  const { providers } = useProvidersStore();
  const { currentUser, users } = useAppStore();
  const { openModal } = useUIStore();

  const stats = getStats();

  // Get cases assigned to current user
  const myCases = cases
    .filter((c) => c.assigneeId === currentUser?.id && c.status !== 'resolved' && c.status !== 'closed')
    .sort((a, b) => new Date(a.sla.dueAt).getTime() - new Date(b.sla.dueAt).getTime())
    .slice(0, 5);

  // Get at-risk cases
  const atRiskCases = cases
    .filter((c) => {
      const state = getSLAState(c);
      return (state === 'at_risk' || state === 'breached') && c.status !== 'resolved' && c.status !== 'closed';
    })
    .sort((a, b) => new Date(a.sla.dueAt).getTime() - new Date(b.sla.dueAt).getTime())
    .slice(0, 5);

  // Calculate repeat provider rate (simulated)
  const repeatRate = 12.5;

  // Average resolution time (simulated - hours)
  const avgResolutionTime = 18.4;

  const kpiCards = [
    {
      title: 'Open Cases',
      value: stats.open + stats.inProgress + stats.pendingProvider,
      icon: Inbox,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/cases?status=open,in_progress,pending_provider',
    },
    {
      title: 'Assigned to Me',
      value: myCases.length,
      icon: User,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      href: '/cases?assignee=me',
    },
    {
      title: 'Unassigned',
      value: stats.unassigned,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/cases?assignee=unassigned',
    },
    {
      title: 'Due in 24h',
      value: cases.filter((c) => {
        const remaining = getTimeRemaining(c);
        return !remaining.isNegative && remaining.hours < 24 && c.status !== 'resolved' && c.status !== 'closed';
      }).length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/cases?slaState=at_risk',
    },
    {
      title: 'Breached SLA',
      value: stats.breached,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      href: '/cases?slaState=breached',
    },
    {
      title: 'Avg Resolution',
      value: `${avgResolutionTime.toFixed(1)}h`,
      icon: Timer,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/reports',
    },
    {
      title: 'Repeat Provider Rate',
      value: `${repeatRate}%`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/reports',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Command Center</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {currentUser?.name.split(' ')[0]}. Here&apos;s what needs your attention.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openModal('create_interaction')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Log Interaction
          </Button>
          <Button onClick={() => openModal('create_case')}>
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.title} href={kpi.href}>
              <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={cn('p-2 rounded-lg', kpi.bgColor)}>
                      <Icon className={cn('w-4 h-4', kpi.color)} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{kpi.title}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Work Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">My Work Today</CardTitle>
            <Link href="/cases?assignee=me">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px]">
              {myCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Inbox className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm">No cases assigned to you</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myCases.map((caseItem) => {
                    const provider = providers.find((p) => p.id === caseItem.providerId);
                    const slaState = getSLAState(caseItem);
                    const timeRemaining = getTimeRemaining(caseItem);

                    return (
                      <Link key={caseItem.id} href={`/cases?selected=${caseItem.id}`}>
                        <div className="p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-primary-600">
                                  {caseItem.id}
                                </span>
                                <Badge variant={caseItem.priority as any} size="sm">
                                  {caseItem.priority}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-slate-900 mt-1 truncate">
                                {caseItem.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {provider?.name || 'Unknown Provider'}
                              </p>
                            </div>
                            <Badge
                              variant={slaState as any}
                              className="ml-2 shrink-0"
                            >
                              {timeRemaining.formatted}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* At Risk / Breaching */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              At Risk / Breaching
            </CardTitle>
            <Link href="/cases?slaState=at_risk,breached">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px]">
              {atRiskCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-green-600">
                  <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">All cases on track!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {atRiskCases.map((caseItem) => {
                    const provider = providers.find((p) => p.id === caseItem.providerId);
                    const assignee = users.find((u) => u.id === caseItem.assigneeId);
                    const slaState = getSLAState(caseItem);
                    const timeRemaining = getTimeRemaining(caseItem);

                    return (
                      <div
                        key={caseItem.id}
                        className={cn(
                          'p-3 rounded-lg border transition-colors',
                          slaState === 'breached'
                            ? 'border-red-200 bg-red-50'
                            : 'border-yellow-200 bg-yellow-50'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-primary-600">
                                {caseItem.id}
                              </span>
                              <Badge variant={slaState as any} size="sm">
                                {timeRemaining.formatted}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-900 mt-1 truncate">
                              {caseItem.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-slate-500">
                                {provider?.name || 'Unknown'}
                              </p>
                              <span className="text-slate-300">•</span>
                              <p className="text-xs text-slate-500">
                                {assignee?.name || 'Unassigned'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="outline" size="sm" className="text-xs h-7">
                              Reassign
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => openModal('create_case')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Case
            </Button>
            <Button variant="outline" onClick={() => openModal('create_interaction')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Log Interaction
            </Button>
            <Button variant="outline" onClick={() => openModal('create_outreach')}>
              <Calendar className="w-4 h-4 mr-2" />
              Add Outreach Attendance
            </Button>
            <Link href="/providers">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Search Provider
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
