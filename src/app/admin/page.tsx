'use client';

import React, { useState } from 'react';
import { Settings, Clock, Tag, Users, Shield, Bell, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/stores/app-store';
import { useUIStore } from '@/stores/ui-store';
import { CATEGORIES, DISPOSITION_CODES, ROOT_CAUSES, SLA_PAUSE_REASONS } from '@/data/categories';

export default function AdminPage() {
  const { users, teams, slaPolicies } = useAppStore();
  const { openModal } = useUIStore();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Settings</h1>
          <p className="text-slate-500 mt-1">Manage SLAs, categories, teams, and system configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sla">
        <TabsList>
          <TabsTrigger value="sla">
            <Clock className="w-4 h-4 mr-2" />
            SLA Policies
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="w-4 h-4 mr-2" />
            Teams & Users
          </TabsTrigger>
          <TabsTrigger value="codes">
            <Shield className="w-4 h-4 mr-2" />
            Disposition Codes
          </TabsTrigger>
        </TabsList>

        {/* SLA Policies */}
        <TabsContent value="sla" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SLA Policies</CardTitle>
              <CardDescription>
                Define target resolution times by category and priority
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {CATEGORIES.map((category) => (
                    <div key={category.id} className="p-4 rounded-lg border border-slate-200 hover:border-primary-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900">{category.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{category.id.replace('cat_', '')}</Badge>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openModal('edit_sla_policy', { categoryId: category.id })}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        {(['urgent', 'high', 'medium', 'low'] as const).map((priority) => (
                          <div
                            key={priority}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <p className="text-xs text-slate-500 capitalize">{priority}</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {category.slaHours[priority]}h
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pause Reasons */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">SLA Pause Reasons</CardTitle>
              <CardDescription>
                Valid reasons for pausing SLA timers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SLA_PAUSE_REASONS.map((reason) => (
                  <Badge key={reason.id} variant="outline">
                    {reason.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inquiry Categories</CardTitle>
              <CardDescription>
                Categories and subcategories for case classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {CATEGORIES.map((category) => (
                    <div key={category.id} className="p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{category.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="secondary" size="sm">
                            Default: {category.defaultPriority}
                          </Badge>
                          {category.isActive ? (
                            <Badge variant="success" size="sm">Active</Badge>
                          ) : (
                            <Badge variant="danger" size="sm">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{category.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.map((sub) => (
                          <Badge key={sub.id} variant="outline" size="sm">
                            {sub.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams & Users */}
        <TabsContent value="teams" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Teams</CardTitle>
                <CardDescription>
                  Team structure and assignment rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {teams.map((team) => {
                      const lead = users.find((u) => u.id === team.leadId);
                      const members = users.filter((u) => team.memberIds.includes(u.id));

                      return (
                        <div key={team.id} className="p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900">{team.name}</h4>
                            <Badge variant="outline" size="sm">
                              {team.assignmentRule.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mb-2">{team.description}</p>
                          <div className="text-xs text-slate-500">
                            <span>Lead: {lead?.name || 'Unassigned'}</span>
                            <span className="mx-2">•</span>
                            <span>{members.length} members</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Users</CardTitle>
                <CardDescription>
                  System users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {users.map((user) => {
                      const team = teams.find((t) => t.id === user.team);

                      return (
                        <div key={user.id} className="p-3 rounded-lg border border-slate-200 hover:border-primary-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" size="sm" className="capitalize">
                                {user.role}
                              </Badge>
                              {user.isActive ? (
                                <Badge variant="success" size="sm">Active</Badge>
                              ) : (
                                <Badge variant="danger" size="sm">Inactive</Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openModal('edit_user', { userId: user.id })}
                                className="ml-1"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <span>{team?.name || 'No team'}</span>
                            <span>•</span>
                            <span>Capacity: {user.capacity}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Disposition Codes */}
        <TabsContent value="codes" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Disposition Codes</CardTitle>
                <CardDescription>
                  Case resolution outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DISPOSITION_CODES.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" size="sm">{code.code}</Badge>
                          <span className="font-medium text-slate-900">{code.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{code.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Root Causes</CardTitle>
                <CardDescription>
                  Issue root cause classifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ROOT_CAUSES.map((cause) => (
                    <div
                      key={cause.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" size="sm">{cause.code}</Badge>
                          <span className="font-medium text-slate-900">{cause.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{cause.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
