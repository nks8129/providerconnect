'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Mail, Users, TrendingUp, ArrowRight, Plus, CheckCircle2, Clock, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/stores/app-store';
import { useUIStore } from '@/stores/ui-store';
import { format, isPast, isFuture } from 'date-fns';

export default function OutreachPage() {
  const { outreachEvents, emailBlasts } = useAppStore();
  const { openModal } = useUIStore();

  const upcomingEvents = outreachEvents
    .filter((e) => isFuture(new Date(e.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const pastEvents = outreachEvents
    .filter((e) => isPast(new Date(e.date)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentBlasts = emailBlasts
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outreach</h1>
          <p className="text-slate-500 mt-1">Manage workshops, webinars, and email campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openModal('tag_provider')}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tag Provider
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-xs text-slate-500">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {pastEvents.reduce((acc, e) => acc + e.attendeeIds.length, 0)}
                </p>
                <p className="text-xs text-slate-500">Total Attendees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailBlasts.length}</p>
                <p className="text-xs text-slate-500">Email Blasts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {recentBlasts.length > 0
                    ? Math.round(
                        (recentBlasts.reduce((acc, b) => acc + b.metrics.opens, 0) /
                          recentBlasts.reduce((acc, b) => acc + b.recipientCount, 0)) *
                          100
                      )
                    : 0}%
                </p>
                <p className="text-xs text-slate-500">Avg Open Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-slate-200 hover:border-primary-300 cursor-pointer transition-colors"
                      onClick={() => openModal('event_detail', { eventId: event.id })}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{event.topic}</p>
                        </div>
                        <Badge variant="outline" size="sm" className="capitalize">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-primary-600">
                          {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Users className="w-3 h-3" />
                            {event.attendeeIds.length}
                            {event.maxAttendees && ` / ${event.maxAttendees}`}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal('event_detail', { eventId: event.id, tab: 'attendees' });
                            }}
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Email Blasts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Email Blasts</CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {recentBlasts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No email blasts yet</p>
              ) : (
                <div className="space-y-3">
                  {recentBlasts.map((blast) => (
                    <div
                      key={blast.id}
                      className="p-3 rounded-lg border border-slate-200 hover:border-primary-300 cursor-pointer transition-colors"
                      onClick={() => openModal('email_blast_detail', { blastId: blast.id })}
                    >
                      <p className="text-sm font-medium">{blast.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{blast.subject}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{blast.recipientCount} recipients</span>
                        <span>{blast.metrics.opens} opens ({Math.round((blast.metrics.opens / blast.recipientCount) * 100)}%)</span>
                        <span>{blast.metrics.clicks} clicks</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Sent {format(new Date(blast.sentAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Past Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Past Events
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {pastEvents.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No past events</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors bg-slate-50/50"
                  onClick={() => openModal('event_detail', { eventId: event.id })}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" size="sm" className="capitalize">
                      {event.type}
                    </Badge>
                    <Badge variant="outline" size="sm" className="text-green-600 border-green-200">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{event.topic}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      {format(new Date(event.date), 'MMM d, yyyy')}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                      <Users className="w-3 h-3" />
                      {event.attendeeIds.length} attended
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
