'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Database, Calendar, Building, LogOut, ChevronsRight, ChevronDown, Headset } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  mode: 'admin' | 'user'
  children: React.ReactNode
}

export default function DashboardLayout({ mode, children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vextria_role')
      router.push('/')
    }
  }

  const basePath = `/${mode}`

  const baseNavItems = [
    { label: 'Overview', path: `${basePath}/overview`, icon: LayoutDashboard },
    { label: 'Data', path: `${basePath}/data`, icon: Database },
    { label: 'Appointments', path: `${basePath}/appointments`, icon: Calendar },
    { label: 'Business Info', path: `${basePath}/business-info`, icon: Building },
  ]

  // Add Agent Selector only for admin
  const navItems = mode === 'admin'
    ? [...baseNavItems, { label: 'Agent Selector', path: `${basePath}/agent-selector`, icon: Headset }]
    : baseNavItems

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-md shadow-lg border border-border"
      >
        <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <nav
        className={cn(
          "sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out z-40",
          open ? 'w-64' : 'w-16',
          "border-border bg-card p-2 shadow-sm",
          // Mobile styles
          "fixed md:sticky",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Title Section */}
        <div className="mb-6 border-b border-border pb-4">
          <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/20">
            <div className="flex items-center gap-3">
              <Logo />
              {open && (
                <div className="transition-opacity duration-200">
                  <span className="block text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    VEXTRIA
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {mode === 'admin' ? 'Admin Panel' : 'User Panel'}
                  </span>
                </div>
              )}
            </div>
            {open && (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-2 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "relative flex h-11 w-full items-center rounded-md transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-blue-500/5 text-blue-300 shadow-sm border-l-4 border-blue-400"
                    : "text-white/70 hover:bg-white/5 hover:text-blue-300"
                )}
              >
                <div className={cn(
                  "grid h-full place-content-center transition-all duration-200",
                  open ? "w-10 ml-1" : "w-12"
                )}>
                  <Icon className={cn(
                    "transition-all duration-200",
                    isActive ? "h-5 w-5" : "h-4 w-4"
                  )} />
                </div>
                {open && (
                  <span className="text-sm font-medium transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Logout Section */}
        {open && (
          <div className="border-t border-white/10 pt-4 space-y-1">
            <div className="px-3 py-2 text-xs font-medium text-white/40 uppercase tracking-wide">
              Account
            </div>
            <button
              onClick={handleLogout}
              className="relative flex h-11 w-full items-center rounded-md transition-all duration-200 text-white/70 hover:bg-white/5 hover:text-red-400 group"
            >
              <div className="grid h-full w-12 place-content-center">
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        )}

        {/* Toggle Button - Hidden on mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="hidden md:block absolute bottom-0 left-0 right-0 border-t border-border transition-colors hover:bg-muted/20"
        >
          <div className="flex items-center p-3">
            <div className="grid size-10 place-content-center">
              <ChevronsRight
                className={cn(
                  "h-4 w-4 transition-transform duration-300 text-muted-foreground",
                  open && "rotate-180"
                )}
              />
            </div>
            {open && (
              <span className="text-sm font-medium text-muted-foreground transition-opacity duration-200">
                Hide
              </span>
            )}
          </div>
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-sm">
      <img
        src="/assets/favicon.svg"
        alt="Vextria Logo"
        className="w-6 h-6"
      />
    </div>
  )
}
