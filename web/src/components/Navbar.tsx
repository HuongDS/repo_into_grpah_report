'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, UploadCloud, LogOut,
  Code2, BookOpen, MessageSquare, GitBranch, Library,
  Settings, PanelLeft, PanelRight, PanelTop, PanelBottom, LayoutTemplate
} from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import { useSettings, NavPosition } from './SettingsProvider'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { navPosition, setNavPosition } = useSettings()
  const [showSettings, setShowSettings] = useState(false)

  if (!session) return null

  const role = (session.user as any)?.role

  const navLinks = [
    { href: '/',                         label: 'Dashboard',  icon: LayoutDashboard },
    { href: '/overview',                 label: 'Tổng quan',  icon: LayoutTemplate },
    { href: '/reports/Question_Evaluate', label: 'Evaluate',   icon: FileText },
    { href: '/reports/Question_Generate', label: 'Generate',   icon: FileText },
    { href: '/reports/Analyze_Source',    label: 'Analyze',    icon: FileText },
    { href: '/reports/Solution_Report',   label: 'Solution',   icon: FileText },
    { href: '/references',               label: 'Tài liệu',   icon: Library },
    { href: '/blog',                     label: 'Blog',       icon: MessageSquare },
    { href: '/admin/upload',             label: 'Thêm',       icon: UploadCloud },
  ]

  const isVertical = navPosition === 'left' || navPosition === 'right'

  const containerClasses = clsx(
    "fixed z-50 transition-all duration-500 ease-in-out pointer-events-none",
    {
      'top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl': navPosition === 'top',
      'bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl': navPosition === 'bottom',
      'left-4 top-1/2 -translate-y-1/2 h-[95vh] max-h-[800px]': navPosition === 'left',
      'right-4 top-1/2 -translate-y-1/2 h-[95vh] max-h-[800px]': navPosition === 'right',
    }
  )

  const navClasses = clsx(
    "bg-navy-950/80 backdrop-blur-xl shadow-2xl shadow-navy-950/40 border border-navy-800/50 rounded-3xl pointer-events-auto flex gap-3",
    isVertical ? "flex-col p-3 h-full overflow-hidden" : "items-center justify-between px-4 py-3"
  )

  const linksContainerClasses = clsx(
    "flex gap-1 bg-navy-900/40 p-1 rounded-2xl custom-scrollbar",
    isVertical ? "flex-col overflow-y-auto flex-1" : "items-center overflow-x-auto flex-1 mx-2"
  )

  const linkClasses = clsx(
    "relative rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 group",
    isVertical ? "px-3 py-3 w-full" : "px-3 py-2"
  )

  return (
    <div className={containerClasses}>
      <motion.nav
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={navClasses}
      >
        {/* Logo */}
        <Link href="/" className={clsx("flex items-center gap-2.5 shrink-0 group", isVertical && "justify-center p-2 mb-2 border-b border-navy-800/50")}>
          <div className="w-9 h-9 bg-gradient-to-br from-navy-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:from-blue-400 group-hover:to-blue-500 transition-all">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          {!isVertical && <span className="font-bold text-white tracking-tight text-sm hidden sm:block">RepoIntoGraph</span>}
        </Link>

        {/* Links */}
        <div className={linksContainerClasses}>
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href} className={clsx(linkClasses, isActive ? 'text-white' : 'text-navy-300 hover:text-white hover:bg-navy-800/60')}>
                {isActive && (
                  <motion.div layoutId="nav-pill" className="absolute inset-0 bg-navy-700 rounded-xl shadow-sm border border-navy-600/50" transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
                )}
                <span className={clsx("relative z-10 flex items-center gap-2 w-full", isVertical && "justify-center xl:justify-start")}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className={clsx(isVertical ? "hidden xl:block" : "")}>{link.label}</span>
                </span>
              </Link>
            )
          })}
        </div>

        {/* Right / Bottom Actions */}
        <div className={clsx("flex gap-2 shrink-0 relative", isVertical ? "flex-col items-center pt-2 border-t border-navy-800/50" : "items-center")}>
          
          <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 text-navy-300 hover:text-white hover:bg-navy-800/60 rounded-xl transition-all relative">
            <Settings className="w-4 h-4" />
          </button>

          <a href="https://github.com/HuongDS/Repo_Into_Graph" target="_blank" rel="noopener noreferrer" className="p-2.5 text-navy-300 hover:text-white hover:bg-navy-800/60 rounded-xl transition-all">
            <GitBranch className="w-4 h-4" />
          </a>

          {!isVertical && (
            <div className="hidden md:flex items-center gap-2 bg-navy-900/50 border border-navy-800/50 px-3 py-1.5 rounded-xl ml-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-navy-500 flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0">
                {session.user?.name?.charAt(0)}
              </div>
              <span className="text-navy-200 text-[11px] font-semibold max-w-[80px] truncate">{session.user?.name}</span>
            </div>
          )}

          <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2.5 text-navy-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut className="w-4 h-4" />
          </button>

          {/* Settings Popover */}
          <AnimatePresence>
            {showSettings && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={clsx(
                  "absolute bg-navy-900 border border-navy-700 p-3 rounded-2xl shadow-xl w-48 z-50",
                  isVertical ? (navPosition === 'left' ? 'left-full ml-4 bottom-0' : 'right-full mr-4 bottom-0') : (navPosition === 'top' ? 'top-full mt-4 right-0' : 'bottom-full mb-4 right-0')
                )}>
                <p className="text-xs font-bold text-navy-300 mb-2 uppercase tracking-wider px-1">Vị trí Navbar</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'top', icon: PanelTop, label: 'Trên' },
                    { id: 'bottom', icon: PanelBottom, label: 'Dưới' },
                    { id: 'left', icon: PanelLeft, label: 'Trái' },
                    { id: 'right', icon: PanelRight, label: 'Phải' },
                  ].map(pos => {
                    const PosIcon = pos.icon
                    const isSel = navPosition === pos.id
                    return (
                      <button key={pos.id} onClick={() => { setNavPosition(pos.id as NavPosition); setShowSettings(false) }}
                        className={clsx("flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all text-xs font-semibold", isSel ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-navy-800/50 border-transparent text-navy-300 hover:bg-navy-800 hover:text-white")}>
                        <PosIcon className="w-4 h-4" />
                        {pos.label}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.nav>
    </div>
  )
}
