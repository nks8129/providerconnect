'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Plus,
  MessageSquare,
  Inbox,
  Clock,
  Calendar,
  FileText,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useProvidersStore } from '@/stores/providers-store';
import { useCasesStore } from '@/stores/cases-store';
import { useInteractionsStore } from '@/stores/interactions-store';
import { useAppStore } from '@/stores/app-store';
import { useUIStore } from '@/stores/ui-store';
import { SPECIALTIES, LINES_OF_BUSINESS } from '@/data/categories';
import { getSLAState, getTimeRemaining } from '@/lib/sla';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;

  const { providers } = useProvidersStore();
  const { cases } = useCasesStore();
  const { interactions } = useInteractionsStore();
  const { outreachEvents, users } = useAppStore();
  const { openModal, setAssistContext } = useUIStore();

  const provider = providers.find((p) => p.id === providerId);
  const providerCases = cases.filter((c) => c.providerId === providerId);
  const providerInteractions = interactions.filter((i) => i.providerId === providerId);
  const providerOutreach = outreachEvents.filter((e) => e.attendeeIds.includes(providerId));

  // Set assist context for this provider
  React.useEffect(() => {
    if (provider) {
      setAssistContext({
        providerId: provider.id,
      });
    }
    return () => setAssistContext(null);
  }, [provider, setAssistContext]);

  if (!provider) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <p className="text-slate-500">Provider not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/providers')}>
            Back to Providers
          </Button>
        </div>
      </div>
    );
  }

  const openCases = providerCases.filter((c) => c.status !== 'resolved' && c.status !== 'closed');
  const resolvedCases = providerCases.filter((c) => c.status === 'resolved' || c.status === 'closed');
  const primaryAddress = provider.addresses.find((a) => a.isPrimary) || provider.addresses[0];
  const primaryContact = provider.contacts.find((c) => c.isPrimary) || provider.contacts[0];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="p-4">
          <Link
            href="/providers"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Providers
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900">{provider.name}</h1>
                  <Badge variant={provider.networkStatus as any}>{provider.networkStatus}</Badge>
                  <Badge variant={provider.credentialingStatus === 'current' ? 'success' : provider.credentialingStatus === 'pending' ? 'warning' : 'danger'}>
                    Cred: {provider.credentialingStatus}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    NPI: {provider.npi}
                  </span>
                  <span>Tax ID: {provider.taxId}</span>
                  <span className="capitalize">{provider.type}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {provider.specialties.map((specId) => {
                    const spec = SPECIALTIES.find((s) => s.id === specId);
                    return (
                      <Badge key={specId} variant="outline" size="sm">
                        {spec?.name || specId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openModal('create_interaction', { providerId })}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Log Interaction
              </Button>
              <Button onClick={() => openModal('create_case', { providerId })}>
                <Plus className="w-4 h-4 mr-2" />
                Create Case
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{openCases.length}</span>
              <span className="text-slate-500">open cases</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{providerInteractions.length}</span>
              <span className="text-slate-500">interactions</span>
            </div>
            {primaryContact && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-4 h-4" />
                  {primaryContact.phone}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-4 h-4" />
                  {primaryContact.email}
                </div>
              </>
            )}
            {primaryAddress && (
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="w-4 h-4" />
                {primaryAddress.city}, {primaryAddress.state}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 bg-white border-b border-slate-200">
          <TabsList className="bg-transparent h-12 p-0 gap-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              Overview
            </TabsTrigger>
            <TabsTrigger value="interactions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              Interactions ({providerInteractions.length})
            </TabsTrigger>
            <TabsTrigger value="cases" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              Cases ({providerCases.length})
            </TabsTrigger>
            <TabsTrigger value="outreach" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              Outreach ({providerOutreach.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none">
              Notes & Tags
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-4">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Provider Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Provider Type</p>
                      <p className="text-sm font-medium capitalize">{provider.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">NPI</p>
                      <p className="text-sm font-medium">{provider.npi}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tax ID</p>
                      <p className="text-sm font-medium">{provider.taxId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Network Status</p>
                      <Badge variant={provider.networkStatus as any} className="mt-1">
                        {provider.networkStatus}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Lines of Business</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.lobs.map((lobId) => {
                        const lob = LINES_OF_BUSINESS.find((l) => l.id === lobId);
                        return (
                          <Badge key={lobId} variant="outline" size="sm">
                            {lob?.name || lobId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {provider.contacts.map((contact) => (
                      <div key={contact.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{contact.name}</p>
                            {contact.isPrimary && (
                              <Badge variant="secondary" size="sm">Primary</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{contact.role}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {provider.addresses.map((address) => (
                      <div key={address.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium capitalize">{address.type}</p>
                            {address.isPrimary && (
                              <Badge variant="secondary" size="sm">Primary</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            {address.street1}
                            {address.street2 && `, ${address.street2}`}
                          </p>
                          <p className="text-sm text-slate-600">
                            {address.city}, {address.state} {address.zip}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Open Cases Summary */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
                  <Link href={`/cases?provider=${provider.id}`}>
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {openCases.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No open cases</p>
                  ) : (
                    <div className="space-y-3">
                      {openCases.slice(0, 3).map((caseItem) => {
                        const slaState = getSLAState(caseItem);
                        const timeRemaining = getTimeRemaining(caseItem);
                        return (
                          <Link key={caseItem.id} href={`/cases?selected=${caseItem.id}`}>
                            <div className="p-3 rounded-lg border border-slate-200 hover:border-primary-300 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-primary-600">{caseItem.id}</span>
                                <Badge variant={slaState as any} size="sm">
                                  {timeRemaining.formatted}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium mt-1 truncate">{caseItem.title}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="mt-0">
            <div className="space-y-3">
              {providerInteractions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                  <p className="text-slate-500">No interactions recorded</p>
                  <Button variant="outline" className="mt-4" onClick={() => openModal('create_interaction', { providerId })}>
                    Log Interaction
                  </Button>
                </div>
              ) : (
                providerInteractions
                  .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
                  .map((interaction) => (
                    <Card key={interaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center',
                                interaction.type === 'call' && 'bg-blue-100',
                                interaction.type === 'email' && 'bg-green-100',
                                interaction.type === 'meeting' && 'bg-purple-100',
                                interaction.type === 'outreach' && 'bg-orange-100'
                              )}
                            >
                              {interaction.type === 'call' ? (
                                <Phone className="w-5 h-5 text-blue-600" />
                              ) : interaction.type === 'email' ? (
                                <Mail className="w-5 h-5 text-green-600" />
                              ) : (
                                <Calendar className="w-5 h-5 text-purple-600" />
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
                          <div className="flex items-center gap-2">
                            <Badge variant={interaction.sentiment as any} size="sm">
                              {interaction.sentiment}
                            </Badge>
                            {interaction.caseId && (
                              <Link href={`/cases?selected=${interaction.caseId}`}>
                                <Badge variant="outline" size="sm">
                                  {interaction.caseId}
                                </Badge>
                              </Link>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mt-3">{interaction.summary}</p>
                        {interaction.notes && (
                          <p className="text-sm text-slate-600 mt-2">{interaction.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases" className="mt-0">
            <div className="space-y-3">
              {providerCases.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                  <p className="text-slate-500">No cases for this provider</p>
                  <Button variant="outline" className="mt-4" onClick={() => openModal('create_case', { providerId })}>
                    Create Case
                  </Button>
                </div>
              ) : (
                providerCases
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map((caseItem) => {
                    const slaState = getSLAState(caseItem);
                    const timeRemaining = getTimeRemaining(caseItem);
                    const assignee = users.find((u) => u.id === caseItem.assigneeId);
                    const isResolved = caseItem.status === 'resolved' || caseItem.status === 'closed';

                    return (
                      <Link key={caseItem.id} href={`/cases?selected=${caseItem.id}`}>
                        <Card className="hover:shadow-card-hover cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-primary-600">{caseItem.id}</span>
                                  <Badge variant={caseItem.status as any} size="sm">
                                    {caseItem.status.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant={caseItem.priority as any} size="sm">
                                    {caseItem.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium mt-1">{caseItem.title}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                  <span>
                                    {isResolved
                                      ? `Resolved ${formatDistanceToNow(new Date(caseItem.resolution.resolvedAt!), { addSuffix: true })}`
                                      : `Updated ${formatDistanceToNow(new Date(caseItem.updatedAt), { addSuffix: true })}`}
                                  </span>
                                  {assignee && (
                                    <>
                                      <span>•</span>
                                      <span>{assignee.name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {!isResolved && (
                                <Badge variant={slaState as any}>
                                  {timeRemaining.formatted}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })
              )}
            </div>
          </TabsContent>

          {/* Outreach Tab */}
          <TabsContent value="outreach" className="mt-0">
            <div className="space-y-3">
              {providerOutreach.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                  <p className="text-slate-500">No outreach events attended</p>
                </div>
              ) : (
                providerOutreach.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-slate-500 capitalize">
                            {event.type} • {format(new Date(event.date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">{event.topic}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Notes & Tags Tab */}
          <TabsContent value="notes" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {provider.notes ? (
                    <p className="text-sm text-slate-600">{provider.notes}</p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No notes added</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  {provider.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {provider.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No tags added</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
