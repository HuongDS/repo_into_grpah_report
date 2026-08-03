'use client'

import { useSession, signOut } from 'next-auth/react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { GitBranch, LogOut } from 'lucide-react'

export function TopBar() {
  const { data: session } = useSession()
  
  if (!session) return null
  
  const role = (session.user as any)?.role

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-800" />
      </div>
      
      <div className="flex items-center gap-2">
        <a href="https://github.com/HuongDS/Repo_Into_Graph" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-xl transition-all" title="GitHub">
          <GitBranch className="w-5 h-5" />
        </a>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl ml-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0 shadow-sm">
            {session.user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-slate-700 text-xs font-semibold hidden sm:inline-block max-w-[100px] truncate">{session.user?.name}</span>
          {role === 'ADMIN' && (
            <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md border border-blue-200 hidden sm:inline-block">ADMIN</span>
          )}
        </div>

        <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-1" title="Đăng xuất">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
