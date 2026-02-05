'use client';

import React from 'react';
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  Inbox,
  MessageSquare,
  Calendar,
  User,
  Settings,
  LogOut,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/stores/ui-store';
import { useAppStore } from '@/stores/app-store';

export function TopBar() {
  const { globalSearchQuery, setGlobalSearchQuery, toggleGlobalSearch, openModal } = useUIStore();
  const { currentUser, reset } = useAppStore();
  const { notifications } = useUIStore();

  const unreadCount = 3; // Simulated unread notifications

  const handleCreateCase = () => {
    openModal('create_case');
  };

  const handleCreateInteraction = () => {
    openModal('create_interaction');
  };

  const handleCreateOutreach = () => {
    openModal('tag_provider');
  };

  const handleResetData = () => {
    if (window.confirm('This will reset all data to the initial demo state. Continue?')) {
      reset();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
      {/* Global Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search cases, providers, or interactions... (Press /)"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onFocus={toggleGlobalSearch}
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 text-[10px] font-medium text-slate-500">
            /
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Create Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Create
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCreateCase}>
              <Inbox className="w-4 h-4 mr-2" />
              New Case
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateInteraction}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Log Interaction
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateOutreach}>
              <Calendar className="w-4 h-4 mr-2" />
              Add Outreach Attendance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="sm">SLA Alert</Badge>
                  <span className="text-xs text-slate-500">2m ago</span>
                </div>
                <p className="text-sm">Case CS-24001 is at risk of breaching SLA in 2 hours</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm">Assignment</Badge>
                  <span className="text-xs text-slate-500">1h ago</span>
                </div>
                <p className="text-sm">New case assigned to you: Claims inquiry from ABC Medical</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">Resolved</Badge>
                  <span className="text-xs text-slate-500">3h ago</span>
                </div>
                <p className="text-sm">Case CS-24002 has been resolved</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary-600">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs">
                  {currentUser ? getInitials(currentUser.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block text-sm font-medium">
                {currentUser?.name || 'User'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{currentUser?.name || 'User'}</span>
                <span className="text-xs font-normal text-slate-500">
                  {currentUser?.email || 'user@healthplan.com'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleResetData} className="text-orange-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Demo Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
