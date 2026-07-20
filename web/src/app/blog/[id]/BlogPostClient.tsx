'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { createComment, deleteComment, deletePost } from '@/app/actions'
import { ArrowLeft, Send, Trash2, MessageSquare, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function BlogPostClient({ post, currentUserId, currentRole, currentUsername }: {
  post: any
  currentUserId: number
  currentRole: string
  currentUsername: string
}) {
  const router = useRouter()
  const [commentText, setCommentText] = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [deletingComment, setDeletingComment] = useState<number | null>(null)
  const [showDeletePost,  setShowDeletePost]  = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    const res = await createComment(post.id, commentText)
    setSubmitting(false)
    if (!res?.error) {
      setCommentText('')
      startTransition(() => router.refresh())
    }
  }

  const handleDeleteComment = async (id: number) => {
    setDeletingComment(id)
    await deleteComment(id)
    setDeletingComment(null)
    startTransition(() => router.refresh())
  }

  const handleDeletePost = async () => {
    await deletePost(post.id)
    router.push('/blog')
  }

  const canDeletePost    = post.authorId === currentUserId
  const canDeleteComment = (authorId: number) => authorId === currentUserId || currentRole === 'ADMIN'

  return (
    <div className="w-[95%] lg:w-[80%] max-w-3xl mx-auto pt-4 pb-24 space-y-6">

      {/* Back */}
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Về Blog
      </Link>

      {/* Post content */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Post header */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 px-8 py-8 text-white">
          <h1 className="text-2xl font-extrabold mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-navy-200 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold uppercase">
                {post.author.username.charAt(0)}
              </div>
              {post.author.username}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {format(new Date(post.createdAt), 'dd MMMM yyyy, HH:mm', { locale: vi })}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {post.comments.length} phản hồi
            </span>
          </div>
        </div>

        {/* Post body (rendered HTML from rich editor) */}
        <div className="px-8 py-8">
          <div
            className="md-prose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Delete post (author/admin) */}
        {canDeletePost && (
          <div className="px-8 pb-6 pt-0 border-t border-slate-50 flex justify-end">
            <button onClick={() => setShowDeletePost(true)}
              className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-xl transition-all">
              <Trash2 className="w-4 h-4" /> Xóa bài viết
            </button>
          </div>
        )}
      </motion.div>

      {/* Comments section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-navy-600" />
            Phản hồi ({post.comments.length})
          </h2>
        </div>

        {/* Comment list */}
        <div className="divide-y divide-slate-50">
          {post.comments.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Chưa có phản hồi. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            post.comments.map((comment: any) => (
              <motion.div key={comment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="px-6 py-4 group hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0 mt-0.5">
                    {comment.author.username.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-bold text-slate-700">{comment.author.username}</span>
                      <span className="text-xs text-slate-400">
                        {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                  </div>
                  {canDeleteComment(comment.authorId) && (
                    <button onClick={() => handleDeleteComment(comment.id)} disabled={deletingComment === comment.id}
                      className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all mt-0.5">
                      {deletingComment === comment.id
                        ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* New comment form */}
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex gap-3 items-end">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
              {currentUsername.charAt(0)}
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
                placeholder="Viết phản hồi... (Enter để gửi, Shift+Enter xuống dòng)"
                rows={2}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 text-sm transition-all"
              />
            </div>
            <button onClick={handleComment} disabled={submitting || !commentText.trim()}
              className="shrink-0 p-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl disabled:opacity-50 transition-all shadow-sm">
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Delete post modal */}
      <AnimatePresence>
        {showDeletePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeletePost(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Xóa bài viết này?</h3>
              <p className="text-slate-500 text-sm mb-6">Toàn bộ phản hồi cũng sẽ bị xóa vĩnh viễn.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeletePost(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 text-sm">Hủy</button>
                <button onClick={handleDeletePost} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 text-sm">Xóa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
