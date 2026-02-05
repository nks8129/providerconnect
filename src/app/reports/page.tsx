'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Download,
  Users,
  Phone,
  Mail,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Award,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCasesStore } from '@/stores/cases-store';
import { useProvidersStore } from '@/stores/providers-store';
import { useInteractionsStore } from '@/stores/interactions-store';
import { useAppStore } from '@/stores/app-store';
import { useUIStore } from '@/stores/ui-store';
import { CATEGORIES } from '@/data/categories';
import { getSLAState } from '@/lib/sla';
import { exportCasesToCSV } from '@/lib/export';
import { subDays, format, startOfDay, endOfDay, isWithinInterval, differenceInHours, getDay } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const STATUS_COLORS = {
  open: '#3b82f6',
  in_progress: '#f59e0b',
  pending_provider: '#f97316',
  resolved: '#22c55e',
  closed: '#64748b',
};

export default function ReportsPage() {
  const { cases } = useCasesStore();
  const { providers } = useProvidersStore();
  const { interactions } = useInteractionsStore();
  const { users, teams } = useAppStore();
  const { addToast } = useUIStore();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case '7d':
        return { start: subDays(now, 7), end: now };
      case '30d':
        return { start: subDays(now, 30), end: now };
      case '90d':
        return { start: subDays(now, 90), end: now };
    }
  };

  const range = getDateRange();
  const previousRange = {
    start: subDays(range.start, dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90),
    end: range.start,
  };

  // Filter cases by date range
  const filteredCases = useMemo(() => {
    return cases.filter((c) =>
      isWithinInterval(new Date(c.createdAt), {
        start: startOfDay(range.start),
        end: endOfDay(range.end),
      })
    );
  }, [cases, range]);

  const previousCases = useMemo(() => {
    return cases.filter((c) =>
      isWithinInterval(new Date(c.createdAt), {
        start: startOfDay(previousRange.start),
        end: endOfDay(previousRange.end),
      })
    );
  }, [cases, previousRange]);

  // Filter interactions
  const filteredInteractions = useMemo(() => {
    return interactions.filter((i) =>
      isWithinInterval(new Date(i.createdAt), {
        start: startOfDay(range.start),
        end: endOfDay(range.end),
      })
    );
  }, [interactions, range]);

  // Calculate percentage change
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Executive KPIs
  const kpis = useMemo(() => {
    const activeCases = filteredCases.filter(
      (c) => c.status !== 'resolved' && c.status !== 'closed'
    );
    const resolvedCases = filteredCases.filter(
      (c) => c.status === 'resolved' || c.status === 'closed'
    );
    const previousResolved = previousCases.filter(
      (c) => c.status === 'resolved' || c.status === 'closed'
    );

    const onTrack = activeCases.filter((c) => getSLAState(c) === 'on_track').length;
    const atRisk = activeCases.filter((c) => getSLAState(c) === 'at_risk').length;
    const breached = activeCases.filter((c) => getSLAState(c) === 'breached').length;

    const complianceRate = activeCases.length > 0
      ? ((onTrack + atRisk) / activeCases.length) * 100
      : 100;

    // Calculate average resolution time
    const resolvedWithTime = resolvedCases.filter((c) => c.resolution?.resolvedAt);
    const avgResolutionHours = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((acc, c) => {
          const created = new Date(c.createdAt);
          const resolved = new Date(c.resolution!.resolvedAt!);
          return acc + differenceInHours(resolved, created);
        }, 0) / resolvedWithTime.length
      : 0;

    // First contact resolution (simulated based on single interaction cases)
    const fcrRate = resolvedCases.length > 0
      ? (resolvedCases.filter((c) => {
          const caseInteractions = interactions.filter((i) => i.caseId === c.id);
          return caseInteractions.length <= 1;
        }).length / resolvedCases.length) * 100
      : 0;

    return {
      totalCases: filteredCases.length,
      totalCasesChange: calcChange(filteredCases.length, previousCases.length),
      activeCases: activeCases.length,
      resolvedCases: resolvedCases.length,
      resolvedChange: calcChange(resolvedCases.length, previousResolved.length),
      onTrack,
      atRisk,
      breached,
      complianceRate,
      avgResolutionHours,
      fcrRate,
      totalInteractions: filteredInteractions.length,
    };
  }, [filteredCases, previousCases, filteredInteractions, interactions]);

  // Volume by category
  const volumeByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCases.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });

    return CATEGORIES.map((cat) => ({
      name: cat.name.split(' ')[0],
      fullName: cat.name,
      count: counts[cat.id] || 0,
    })).sort((a, b) => b.count - a.count);
  }, [filteredCases]);

  // Volume by channel
  const volumeByChannel = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCases.forEach((c) => {
      counts[c.channel] = (counts[c.channel] || 0) + 1;
    });

    return [
      { name: 'Phone', value: counts['phone'] || 0, icon: Phone },
      { name: 'Email', value: counts['email'] || 0, icon: Mail },
      { name: 'Portal', value: counts['portal'] || 0, icon: Globe },
      { name: 'Fax', value: counts['fax'] || 0, icon: FileText },
    ];
  }, [filteredCases]);

  // Volume by priority
  const volumeByPriority = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCases.forEach((c) => {
      counts[c.priority] = (counts[c.priority] || 0) + 1;
    });

    return [
      { name: 'Urgent', value: counts['urgent'] || 0, color: '#ef4444' },
      { name: 'High', value: counts['high'] || 0, color: '#f97316' },
      { name: 'Medium', value: counts['medium'] || 0, color: '#3b82f6' },
      { name: 'Low', value: counts['low'] || 0, color: '#64748b' },
    ];
  }, [filteredCases]);

  // SLA trend over time
  const slaTrend = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const data: { date: string; compliance: number; breached: number }[] = [];
    const step = dateRange === '90d' ? 7 : 1;

    for (let i = days - 1; i >= 0; i -= step) {
      const date = subDays(new Date(), i);
      const endDate = subDays(new Date(), Math.max(0, i - step + 1));

      const periodCases = cases.filter((c) => {
        const created = new Date(c.createdAt);
        return created >= startOfDay(date) && created <= endOfDay(endDate);
      });

      const active = periodCases.filter(
        (c) => c.status !== 'resolved' && c.status !== 'closed'
      );
      const onTrack = active.filter((c) => getSLAState(c) !== 'breached').length;
      const compliance = active.length > 0 ? (onTrack / active.length) * 100 : 100;
      const breached = active.filter((c) => getSLAState(c) === 'breached').length;

      data.push({
        date: format(date, dateRange === '7d' ? 'EEE' : 'MMM d'),
        compliance: Math.round(compliance),
        breached,
      });
    }

    return data;
  }, [cases, dateRange]);

  // Volume over time with comparison
  const volumeOverTime = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const data: { date: string; current: number; previous: number }[] = [];
    const step = dateRange === '90d' ? 7 : 1;

    for (let i = days - 1; i >= 0; i -= step) {
      const currentDate = subDays(new Date(), i);
      const previousDate = subDays(currentDate, days);
      const endDate = subDays(new Date(), Math.max(0, i - step + 1));
      const prevEndDate = subDays(endDate, days);

      const currentCount = filteredCases.filter((c) => {
        const created = new Date(c.createdAt);
        return created >= startOfDay(currentDate) && created <= endOfDay(endDate);
      }).length;

      const previousCount = cases.filter((c) => {
        const created = new Date(c.createdAt);
        return created >= startOfDay(previousDate) && created <= endOfDay(prevEndDate);
      }).length;

      data.push({
        date: format(currentDate, dateRange === '7d' ? 'EEE' : 'MMM d'),
        current: currentCount,
        previous: previousCount,
      });
    }

    return data;
  }, [filteredCases, cases, dateRange]);

  // Team performance
  const teamPerformance = useMemo(() => {
    return teams.map((team) => {
      const teamMembers = users.filter((u) => u.team === team.id);
      const teamMemberIds = teamMembers.map((u) => u.id);
      const teamCases = filteredCases.filter((c) => teamMemberIds.includes(c.assigneeId || ''));
      const resolved = teamCases.filter((c) => c.status === 'resolved' || c.status === 'closed');
      const active = teamCases.filter((c) => c.status !== 'resolved' && c.status !== 'closed');
      const onTrack = active.filter((c) => getSLAState(c) !== 'breached').length;

      return {
        name: team.name.replace(' Team', ''),
        fullName: team.name,
        total: teamCases.length,
        resolved: resolved.length,
        active: active.length,
        slaCompliance: active.length > 0 ? Math.round((onTrack / active.length) * 100) : 100,
        avgWorkload: teamMembers.length > 0 ? Math.round(teamCases.length / teamMembers.length) : 0,
      };
    }).sort((a, b) => b.total - a.total);
  }, [teams, users, filteredCases]);

  // Top specialists
  const topSpecialists = useMemo(() => {
    const specialistStats = users.map((user) => {
      const userCases = filteredCases.filter((c) => c.assigneeId === user.id);
      const resolved = userCases.filter((c) => c.status === 'resolved' || c.status === 'closed');
      const active = userCases.filter((c) => c.status !== 'resolved' && c.status !== 'closed');
      const onTrack = active.filter((c) => getSLAState(c) !== 'breached').length;

      return {
        name: user.name,
        role: user.role,
        total: userCases.length,
        resolved: resolved.length,
        slaCompliance: active.length > 0 ? Math.round((onTrack / active.length) * 100) : 100,
      };
    });

    return specialistStats.sort((a, b) => b.resolved - a.resolved).slice(0, 8);
  }, [users, filteredCases]);

  // Top providers by case volume
  const topProviders = useMemo(() => {
    const providerCounts: Record<string, number> = {};
    filteredCases.forEach((c) => {
      providerCounts[c.providerId] = (providerCounts[c.providerId] || 0) + 1;
    });

    return Object.entries(providerCounts)
      .map(([id, count]) => {
        const provider = providers.find((p) => p.id === id);
        return {
          id,
          name: provider?.name || 'Unknown',
          type: provider?.type || 'unknown',
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredCases, providers]);

  // Heat map data (day of week)
  const heatMapData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);

    filteredCases.forEach((c) => {
      const day = getDay(new Date(c.createdAt));
      counts[day]++;
    });

    return dayNames.map((name, i) => ({
      day: name,
      cases: counts[i],
      fill: counts[i] > 20 ? '#ef4444' : counts[i] > 10 ? '#f59e0b' : counts[i] > 5 ? '#3b82f6' : '#94a3b8',
    }));
  }, [filteredCases]);

  // Resolution time by category
  const resolutionByCategory = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const catCases = filteredCases.filter(
        (c) => c.category === cat.id && c.resolution?.resolvedAt
      );

      if (catCases.length === 0) return { name: cat.name.split(' ')[0], hours: 0 };

      const avgHours = catCases.reduce((acc, c) => {
        const created = new Date(c.createdAt);
        const resolved = new Date(c.resolution!.resolvedAt!);
        return acc + differenceInHours(resolved, created);
      }, 0) / catCases.length;

      return {
        name: cat.name.split(' ')[0],
        fullName: cat.name,
        hours: Math.round(avgHours),
        target: cat.slaHours.medium,
      };
    }).filter((d) => d.hours > 0);
  }, [filteredCases]);

  const handleExport = () => {
    exportCasesToCSV(filteredCases, providers, users);
    addToast({
      type: 'success',
      title: 'Export Complete',
      message: `${filteredCases.length} cases exported to CSV`,
    });
  };

  const KPICard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    suffix = '',
    invertChange = false,
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: any;
    color: string;
    suffix?: string;
    invertChange?: boolean;
  }) => {
    const isPositive = invertChange ? (change ?? 0) < 0 : (change ?? 0) > 0;

    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="text-2xl font-bold text-slate-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {suffix && <span className="text-lg font-normal text-slate-500 ml-1">{suffix}</span>}
              </p>
              {change !== undefined && (
                <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(change).toFixed(1)}% vs previous period
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${color}`} />
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1">Performance metrics and strategic insights</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-xl border border-slate-200 p-1 bg-white shadow-sm">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  dateRange === r
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Button onClick={handleExport} className="shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Cases"
          value={kpis.totalCases}
          change={kpis.totalCasesChange}
          icon={BarChart3}
          color="bg-blue-500"
        />
        <KPICard
          title="SLA Compliance"
          value={kpis.complianceRate.toFixed(1)}
          suffix="%"
          icon={Target}
          color="bg-green-500"
        />
        <KPICard
          title="Avg Resolution Time"
          value={kpis.avgResolutionHours.toFixed(0)}
          suffix="hrs"
          icon={Clock}
          color="bg-purple-500"
          invertChange
        />
        <KPICard
          title="Cases Resolved"
          value={kpis.resolvedCases}
          change={kpis.resolvedChange}
          icon={CheckCircle2}
          color="bg-emerald-500"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{kpis.breached}</p>
                <p className="text-xs text-slate-500">SLA Breached</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{kpis.atRisk}</p>
                <p className="text-xs text-slate-500">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{kpis.activeCases}</p>
                <p className="text-xs text-slate-500">Active Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Zap className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-600">{kpis.fcrRate.toFixed(0)}%</p>
                <p className="text-xs text-slate-500">First Contact Resolution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border shadow-sm p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary-50">
            <PieChartIcon className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sla" className="data-[state=active]:bg-primary-50">
            <Target className="w-4 h-4 mr-2" />
            SLA Analysis
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-primary-50">
            <Users className="w-4 h-4 mr-2" />
            Team Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-primary-50">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="providers" className="data-[state=active]:bg-primary-50">
            <Award className="w-4 h-4 mr-2" />
            Provider Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Volume by Category */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Case Volume by Category</CardTitle>
                <CardDescription>Distribution of cases across inquiry types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={volumeByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 shadow-lg rounded-lg border">
                              <p className="font-medium">{data.fullName}</p>
                              <p className="text-sm text-slate-600">{data.count} cases</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Channel</CardTitle>
                <CardDescription>Inbound channel breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {volumeByChannel.map((channel, idx) => {
                    const Icon = channel.icon;
                    const total = volumeByChannel.reduce((a, b) => a + b.value, 0);
                    const pct = total > 0 ? (channel.value / total) * 100 : 0;
                    return (
                      <div key={channel.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium">{channel.name}</span>
                          </div>
                          <span className="text-sm font-bold">{channel.value}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: COLORS[idx],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={volumeByPriority}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {volumeByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Day of Week Heat Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Case Volume by Day</CardTitle>
                <CardDescription>Peak days for case creation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={heatMapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="cases" radius={[4, 4, 0, 0]}>
                      {heatMapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SLA Analysis Tab */}
        <TabsContent value="sla" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* SLA Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">SLA Compliance Trend</CardTitle>
                <CardDescription>Track compliance rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={slaTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="compliance"
                      name="Compliance %"
                      fill="#22c55e20"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="breached"
                      name="Breached"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* SLA Gauge */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current SLA Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[250px]">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke={kpis.complianceRate >= 90 ? '#22c55e' : kpis.complianceRate >= 75 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="12"
                        strokeDasharray={`${(kpis.complianceRate / 100) * 440} 440`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{kpis.complianceRate.toFixed(0)}%</span>
                      <span className="text-xs text-slate-500">Compliance</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{kpis.onTrack}</p>
                      <p className="text-xs text-slate-500">On Track</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-600">{kpis.atRisk}</p>
                      <p className="text-xs text-slate-500">At Risk</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{kpis.breached}</p>
                      <p className="text-xs text-slate-500">Breached</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resolution Time by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average Resolution Time by Category</CardTitle>
              <CardDescription>Actual vs SLA target (medium priority)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resolutionByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 shadow-lg rounded-lg border">
                            <p className="font-medium">{data.fullName}</p>
                            <p className="text-sm">Actual: <span className="font-bold">{data.hours}h</span></p>
                            <p className="text-sm">Target: <span className="font-bold">{data.target}h</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="hours" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Team Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={teamPerformance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="SLA Compliance"
                      dataKey="slaCompliance"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.5}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Stats Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-xs text-slate-500">
                        <th className="text-left py-2 font-medium">Team</th>
                        <th className="text-right py-2 font-medium">Cases</th>
                        <th className="text-right py-2 font-medium">Resolved</th>
                        <th className="text-right py-2 font-medium">SLA %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamPerformance.map((team) => (
                        <tr key={team.name} className="border-b last:border-0">
                          <td className="py-3 font-medium">{team.fullName}</td>
                          <td className="py-3 text-right">{team.total}</td>
                          <td className="py-3 text-right text-green-600">{team.resolved}</td>
                          <td className="py-3 text-right">
                            <Badge
                              variant={team.slaCompliance >= 90 ? 'success' : team.slaCompliance >= 75 ? 'warning' : 'danger'}
                              size="sm"
                            >
                              {team.slaCompliance}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Top Specialists */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performing Specialists</CardTitle>
              <CardDescription>Ranked by cases resolved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {topSpecialists.slice(0, 8).map((specialist, idx) => (
                  <div
                    key={specialist.name}
                    className={`p-4 rounded-lg border ${idx === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {idx === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                      <span className="text-sm font-medium truncate">{specialist.name}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Resolved</span>
                        <span className="font-bold text-green-600">{specialist.resolved}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">SLA</span>
                        <span className="font-bold">{specialist.slaCompliance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Volume Trend Comparison</CardTitle>
              <CardDescription>Current period vs previous period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={volumeOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="current"
                    name="Current Period"
                    stroke="#3b82f6"
                    fill="#3b82f620"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="previous"
                    name="Previous Period"
                    stroke="#94a3b8"
                    fill="#94a3b820"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Provider Insights Tab */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Providers by Case Volume</CardTitle>
              <CardDescription>Providers with the most inquiries this period</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {topProviders.map((provider, idx) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          idx < 3 ? 'bg-primary-500' : 'bg-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{provider.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{provider.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{provider.count}</p>
                        <p className="text-xs text-slate-500">cases</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
