'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createPost } from '@/app/actions'
import RichEditor from '@/components/RichEditor'
import { ArrowLeft, Send } from 'lucide-react'

export default function NewPostPage() {
  const router = useRouter()
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề bài viết'); return }
    if (!content.trim() || content === '<p></p>') { setError('Vui lòng nhập nội dung bài viết'); return }
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.set('title',   title)
    formData.set('content', content)
    const res = await createPost(formData)
    setLoading(false)
    if (res?.error) { setError(res.error) }
    else if (res?.postId) { router.push(`/blog/${res.postId}`) }
  }

  return (
    <div className="w-[95%] lg:w-[80%] max-w-3xl mx-auto pt-4 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 mb-5 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Quay lại Blog
        </button>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 p-8 text-white">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <p className="text-navy-300 text-xs font-semibold uppercase tracking-widest mb-2">Blog nhóm nghiên cứu</p>
            <h1 className="text-2xl font-bold">Đăng bài thảo luận mới</h1>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Error */}
        {error && (
          <div className="px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-3">Tiêu đề bài viết</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="VD: Vấn đề khi generate câu hỏi dạng multiple-choice..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 text-slate-800 font-semibold transition-all"
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-3">Nội dung bài viết</label>
          <RichEditor
            content={content}
            onChange={setContent}
            placeholder="Mô tả chi tiết vấn đề, câu hỏi, hoặc nội dung bạn muốn thảo luận với nhóm..."
            minHeight="250px"
          />
          <p className="text-xs text-slate-400 mt-2">Hỗ trợ định dạng: **bold**, *italic*, heading, code, danh sách, link.</p>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-navy-700 hover:bg-navy-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-navy-900/20 disabled:opacity-60 transition-all"
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Send className="w-5 h-5" /> Đăng bài</>
          }
        </motion.button>
      </div>
    </div>
  )
}
