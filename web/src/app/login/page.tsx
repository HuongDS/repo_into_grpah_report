'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, User, ArrowRight, Code2, ShieldCheck, GitBranch, ChevronRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false
      })

      if (res?.error) {
        setError('Tài khoản hoặc mật khẩu không chính xác')
        setIsLoading(false)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('Đã xảy ra lỗi, vui lòng thử lại sau')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Left Side: Branding / Intro */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-48 h-48 bg-blue-300 opacity-20 rounded-full blur-2xl" />

          <div className="relative z-10">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl mb-8"
            >
              <Code2 className="w-7 h-7 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-4"
            >
              Repo Into <br/> Graph System
            </motion.h1>
            
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-blue-100 font-medium leading-relaxed max-w-sm text-sm"
            >
              Hệ thống quản lý, giám sát và phân tích báo cáo đồ thị mã nguồn tiên tiến nhất dành cho team phát triển.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="relative z-10 mt-12 md:mt-0 flex items-center gap-3 text-sm font-semibold text-blue-200"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Nội bộ lưu hành</span>
          </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-7/12 p-10 md:p-16 lg:p-20 flex flex-col justify-center bg-white/40">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-10">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Chào mừng trở lại! 👋</h2>
              <p className="text-slate-500 text-sm font-medium">Vui lòng đăng nhập để tiếp tục truy cập vào hệ thống báo cáo.</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 transition-colors group-focus-within:text-blue-600">Tài khoản</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-300 font-medium"
                    placeholder="Nhập tên đăng nhập..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide transition-colors group-focus-within:text-blue-600">Mật khẩu</label>
                  <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Quên mật khẩu?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-10 flex items-center justify-center gap-4">
              <a href="https://github.com/HuongDS/Repo_Into_Graph" target="_blank" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md">
                <GitBranch className="w-4 h-4" />
                <span>Xem Source Code</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
