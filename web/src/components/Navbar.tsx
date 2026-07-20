'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, UploadCloud, LogOut, Code2 } from 'lucide-react'
import clsx from 'clsx'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Nếu không có session (chưa đăng nhập), không hiển thị Navbar vì mọi route bị khoá
  if (!session) return null

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reports/Question_Evaluate', label: 'Evaluate', icon: FileText },
    { href: '/reports/Question_Generate', label: 'Generate', icon: FileText },
    { href: '/reports/Solution_Report', label: 'Solution', icon: FileText },
    { href: '/admin/upload', label: 'Thêm Báo Cáo', icon: UploadCloud },
  ]

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-2 md:px-4 py-4 pointer-events-none">
      <div className="w-[98%] lg:w-[90%] mx-auto">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 rounded-2xl px-4 py-3 flex flex-col md:flex-row items-center justify-between pointer-events-auto gap-4 md:gap-8"
        >
          {/* Top section on mobile, Left on desktop */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 tracking-tight">RepoIntoGraph</span>
            </Link>

            {/* Mobile User Profile (hidden on desktop) */}
            <div className="flex md:hidden items-center gap-2">
              <div className="text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 whitespace-nowrap max-w-[100px] truncate">
                {session.user?.name}
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links - Scrollable on Mobile */}
          <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl overflow-x-auto custom-scrollbar w-full md:w-auto md:flex-1 md:justify-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "relative px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0",
                    isActive ? "text-blue-700" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={clsx("w-4 h-4", isActive ? "text-blue-600" : "")} />
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Desktop User Profile (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 whitespace-nowrap">
              <span className="text-slate-400 font-normal mr-1">Xin chào,</span> 
              {session.user?.name}
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </motion.nav>
      </div>
    </div>
  )
}
