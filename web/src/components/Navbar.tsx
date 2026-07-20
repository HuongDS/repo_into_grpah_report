'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, UploadCloud, LogOut,
  Code2, BookOpen, MessageSquare, GitBranch, Library
} from 'lucide-react'
import clsx from 'clsx'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  const role = (session.user as any)?.role

  const navLinks = [
    { href: '/',                         label: 'Dashboard',  icon: LayoutDashboard },
    { href: '/reports/Question_Evaluate', label: 'Evaluate',   icon: FileText },
    { href: '/reports/Question_Generate', label: 'Generate',   icon: FileText },
    { href: '/reports/Solution_Report',   label: 'Solution',   icon: FileText },
    { href: '/references',               label: 'Tài liệu',   icon: Library },
    { href: '/blog',                     label: 'Blog',        icon: MessageSquare },
    { href: '/admin/upload',             label: 'Thêm',        icon: UploadCloud },
  ]

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-2 md:px-4 py-3 pointer-events-none">
      <div className="w-[98%] lg:w-[92%] mx-auto">
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="bg-navy-950/95 backdrop-blur-md shadow-lg shadow-navy-950/30 border border-navy-800/50 rounded-2xl px-4 py-2.5 flex items-center justify-between pointer-events-auto gap-3"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-navy-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:from-blue-400 group-hover:to-blue-500 transition-all">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight text-sm hidden sm:block">RepoIntoGraph</span>
          </Link>

          {/* Nav links — scrollable on mobile */}
          <div className="flex items-center gap-0.5 bg-navy-900/60 p-1 rounded-xl overflow-x-auto custom-scrollbar flex-1 mx-2">
            {navLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}
                  className={clsx(
                    'relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0',
                    isActive ? 'text-white' : 'text-navy-300 hover:text-white hover:bg-navy-700/50'
                  )}
                >
                  {isActive && (
                    <motion.div layoutId="nav-pill"
                      className="absolute inset-0 bg-navy-600 rounded-lg shadow-sm border border-navy-500/50"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Right: GitHub + user */}
          <div className="flex items-center gap-2 shrink-0">
            {/* GitHub link */}
            <a href="https://github.com/HuongDS/Repo_Into_Graph" target="_blank" rel="noopener noreferrer"
              title="Xem dự án gốc trên GitHub"
              className="p-2 text-navy-300 hover:text-white hover:bg-navy-700/50 rounded-xl transition-all">
              <GitBranch className="w-4 h-4" />
            </a>

            {/* User chip */}
            <div className="hidden sm:flex items-center gap-1.5 bg-navy-800/60 border border-navy-700/50 px-3 py-1.5 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-navy-500 flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0">
                {session.user?.name?.charAt(0)}
              </div>
              <span className="text-navy-200 text-xs font-medium max-w-[80px] truncate">{session.user?.name}</span>
              {role === 'ADMIN' && (
                <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md border border-blue-500/20">ADMIN</span>
              )}
            </div>

            {/* Logout */}
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              title="Đăng xuất"
              className="p-2 text-navy-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </motion.nav>
      </div>
    </div>
  )
}
