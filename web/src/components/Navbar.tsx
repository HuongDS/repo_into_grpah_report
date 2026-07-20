'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, UploadCloud, LogOut,
  Code2, MessageSquare, GitBranch, Library,
  Settings, PanelLeft, PanelRight, PanelTop, PanelBottom, LayoutTemplate, X
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
    "bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 border border-slate-200 rounded-3xl pointer-events-auto flex gap-3",
    isVertical ? "flex-col p-3 h-full overflow-hidden" : "items-center justify-between px-4 py-3"
  )

  const linksContainerClasses = clsx(
    "flex gap-1 bg-slate-100/50 p-1 rounded-2xl custom-scrollbar",
    isVertical ? "flex-col overflow-y-auto flex-1" : "items-center overflow-x-auto flex-1 mx-2"
  )

  const linkClasses = clsx(
    "relative rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 group",
    isVertical ? "px-3 py-3 w-full" : "px-3 py-2"
  )

  return (
    <>
      <div className={containerClasses}>
        <motion.nav
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={navClasses}
        >
          {/* Logo */}
          <Link href="/" className={clsx("flex items-center gap-2.5 shrink-0 group", isVertical && "justify-center p-2 mb-2 border-b border-slate-200")}>
            <div className="w-9 h-9 bg-gradient-to-br from-navy-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:from-blue-400 group-hover:to-blue-500 transition-all">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            {!isVertical && <span className="font-extrabold text-slate-800 tracking-tight text-sm hidden sm:block">RepoIntoGraph</span>}
          </Link>

          {/* Links */}
          <div className={linksContainerClasses}>
            {navLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href} className={clsx(linkClasses, isActive ? 'text-navy-700' : 'text-slate-500 hover:text-navy-700 hover:bg-slate-200/50')}>
                  {isActive && (
                    <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200" transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
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
          <div className={clsx("flex gap-2 shrink-0 relative", isVertical ? "flex-col items-center pt-2 border-t border-slate-200" : "items-center")}>
            
            <button onClick={() => setShowSettings(true)} className="p-2.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-xl transition-all relative" title="Cài đặt giao diện">
              <Settings className="w-4 h-4" />
            </button>

            <a href="https://github.com/HuongDS/Repo_Into_Graph" target="_blank" rel="noopener noreferrer" className="p-2.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-xl transition-all" title="GitHub">
              <GitBranch className="w-4 h-4" />
            </a>

            {!isVertical && (
              <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl ml-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-navy-500 flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0">
                  {session.user?.name?.charAt(0)}
                </div>
                <span className="text-slate-700 text-[11px] font-semibold max-w-[80px] truncate">{session.user?.name}</span>
                {role === 'ADMIN' && (
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md border border-blue-200">ADMIN</span>
                )}
              </div>
            )}

            <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Đăng xuất">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Settings Modal (Fixed to viewport) */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-slate-200 p-6 rounded-3xl shadow-2xl w-full max-w-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400" />
                  Cài đặt giao diện
                </h3>
                <button onClick={() => setShowSettings(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs font-bold text-slate-500 mb-3">Vị trí thanh điều hướng (Navbar)</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'top', icon: PanelTop, label: 'Bên trên' },
                  { id: 'bottom', icon: PanelBottom, label: 'Bên dưới' },
                  { id: 'left', icon: PanelLeft, label: 'Bên trái' },
                  { id: 'right', icon: PanelRight, label: 'Bên phải' },
                ].map(pos => {
                  const PosIcon = pos.icon
                  const isSel = navPosition === pos.id
                  return (
                    <button key={pos.id} onClick={() => { setNavPosition(pos.id as NavPosition); setShowSettings(false) }}
                      className={clsx("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all text-xs font-bold", isSel ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700")}>
                      <PosIcon className="w-6 h-6" />
                      {pos.label}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
