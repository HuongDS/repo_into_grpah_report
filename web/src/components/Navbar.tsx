'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { FileText, PlusCircle, LogIn, LogOut, Home } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
              <FileText className="w-6 h-6" />
              <span>GraphReport</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link href="/reports/Question_Evaluate" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Evaluate</Link>
              <Link href="/reports/Question_Generate" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Generate</Link>
              <Link href="/reports/Solution_Report" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Solution</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/admin/upload" className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium transition-colors text-sm">
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Report</span>
                </Link>
                <div className="flex items-center gap-3 border-l pl-4 ml-2">
                  <span className="text-sm text-gray-600 font-medium">Hi, {session.user?.name}</span>
                  <button 
                    onClick={() => signOut()}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link href="/api/auth/signin" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors text-sm shadow-sm">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
