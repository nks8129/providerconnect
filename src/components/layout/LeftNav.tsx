'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Inbox,
  Users,
  MessageSquare,
  Megaphone,
  BarChart3,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { LouisianaBlueLogoIcon, LouisianaBlueLogoFull } from '@/lib/louisiana-blue-logo';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/cases', label: 'Cases', icon: Inbox },
  { href: '/providers', label: 'Providers', icon: Users },
  { href: '/interactions', label: 'Interactions', icon: MessageSquare },
  { href: '/outreach', label: 'Outreach', icon: Megaphone },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/admin', label: 'Admin', icon: Settings },
];

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Particle 1 */}
      <div
        className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float-slow"
        style={{ left: '20%', top: '30%' }}
      />
      {/* Particle 2 */}
      <div
        className="absolute w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-float-medium"
        style={{ left: '70%', top: '50%' }}
      />
      {/* Particle 3 */}
      <div
        className="absolute w-1 h-1 bg-blue-300/25 rounded-full animate-float-fast"
        style={{ left: '40%', top: '70%' }}
      />
      {/* Particle 4 */}
      <div
        className="absolute w-0.5 h-0.5 bg-sky-400/30 rounded-full animate-float-slow"
        style={{ left: '80%', top: '20%' }}
      />
      {/* Particle 5 */}
      <div
        className="absolute w-1 h-1 bg-indigo-400/20 rounded-full animate-float-medium"
        style={{ left: '15%', top: '85%' }}
      />
      {/* Glowing orb effect */}
      <div
        className="absolute w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow"
        style={{ left: '-10%', top: '40%' }}
      />
      <div
        className="absolute w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl animate-pulse-slow"
        style={{ right: '-10%', bottom: '20%' }}
      />
    </div>
  );
}

export function LeftNav() {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/' || pathname === '/home';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        'relative flex flex-col h-full text-white transition-all duration-200 overflow-hidden',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 30%, #0f172a 70%, #020617 100%)',
      }}
    >
      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Logo & Brand */}
      <div
        className={cn(
          'relative z-10 flex flex-col border-b border-slate-700/50',
          sidebarCollapsed ? 'items-center py-3' : 'items-start px-4 py-4'
        )}
      >
        {!sidebarCollapsed ? (
          <div className="space-y-2">
            <LouisianaBlueLogoFull />
            <div className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
              Provider Connect
            </div>
          </div>
        ) : (
          <LouisianaBlueLogoIcon size={32} />
        )}
      </div>

      {/* Navigation Items */}
      <div className="relative z-10 flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-0.5',
                    sidebarCollapsed && 'justify-center px-2'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    'w-5 h-5 shrink-0 transition-transform',
                    active && 'drop-shadow-glow'
                  )} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom glow effect */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(6, 182, 212, 0.05) 0%, transparent 100%)',
        }}
      />

      {/* Collapse Toggle */}
      <div className="relative z-10 p-2 border-t border-slate-700/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            'w-full text-slate-400 hover:text-white hover:bg-white/10',
            sidebarCollapsed && 'px-2'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </nav>
  );
}
