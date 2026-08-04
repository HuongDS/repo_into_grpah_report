'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MessageCircle, Send, Trash2, X } from 'lucide-react'
import { createReportFeedback, deleteReportFeedback, getReportFeedbacks } from '@/app/actions'
import RichEditor from '@/components/RichEditor'
import RichTextViewer from '@/components/RichTextViewer'

type Feedback = { id: number; content: string; authorId: number; createdAt: Date | string; author: { id: number; username: string } }

const hasRichContent = (html: string) => /<(img|hr)\b/i.test(html) || html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0
const textLength = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length

export default function ReportFeedback({ reportId, reportTitle, initialCount = 0, currentUserId, currentUserRole }: {
  reportId: number; reportTitle: string; initialCount?: number; currentUserId: number | null; currentUserRole: string
}) {
  const [open, setOpen] = useState(false)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [count, setCount] = useState(initialCount)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    let active = true
    getReportFeedbacks(reportId).then(result => {
      if (!active) return
      if ('error' in result) setError(result.error || 'Không thể tải phản hồi')
      else { setFeedbacks(result.feedbacks as Feedback[]); setCount(result.feedbacks.length) }
    }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [open, reportId])

  const submit = async () => {
    if (!hasRichContent(content) || submitting) return
    setSubmitting(true); setError('')
    const result = await createReportFeedback(reportId, content)
    if (result.error) setError(result.error)
    else if (result.feedback) { setFeedbacks(items => [...items, result.feedback as Feedback]); setCount(value => value + 1); setContent('') }
    setSubmitting(false)
  }

  const showFeedbacks = () => {
    setLoading(true)
    setError('')
    setOpen(true)
  }

  const remove = async (id: number) => {
    const result = await deleteReportFeedback(id)
    if (result.error) return setError(result.error)
    setFeedbacks(items => items.filter(item => item.id !== id)); setCount(value => Math.max(0, value - 1))
  }

  return <>
    <button type="button" onClick={event => { event.stopPropagation(); showFeedbacks() }} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-navy-50 hover:text-navy-600 transition-colors" aria-label={`Xem ${count} phản hồi của ${reportTitle}`}>
      <MessageCircle className="w-4 h-4" /><span>{count}</span><span className="hidden sm:inline">Phản hồi</span>
    </button>
    {typeof document !== 'undefined' && createPortal(<AnimatePresence>
      {open && <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center sm:p-6" onClick={event => event.stopPropagation()}>
        <motion.div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
        <motion.section role="dialog" aria-modal="true" aria-label={`Phản hồi cho ${reportTitle}`} initial={{ opacity: 0, y: 30, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .98 }} className="relative w-full sm:w-[60vw] sm:max-w-none max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <header className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
            <div className="min-w-0"><div className="flex items-center gap-2 text-navy-700 font-bold"><MessageCircle className="w-5 h-5" /> Phản hồi ({count})</div><p className="text-sm text-slate-500 truncate mt-1" title={reportTitle}>{reportTitle}</p></div>
            <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="w-5 h-5" /></button>
          </header>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-48">
            {loading ? <div className="h-36 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-navy-500" /></div> : feedbacks.length === 0 ?
              <div className="h-36 flex flex-col items-center justify-center text-center text-slate-400"><MessageCircle className="w-9 h-9 mb-3 text-slate-300" /><p className="font-semibold text-slate-600">Chưa có phản hồi</p><p className="text-sm">Hãy là người đầu tiên góp ý cho báo cáo này.</p></div> :
              feedbacks.map(feedback => <article key={feedback.id} className="flex gap-3 group">
                <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 text-white flex items-center justify-center text-sm font-bold uppercase">{feedback.author.username.charAt(0)}</div>
                <div className="flex-1 min-w-0 rounded-2xl bg-slate-50 px-4 py-3"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><span className="text-sm font-bold text-slate-700">{feedback.author.username}</span><span className="text-xs text-slate-400 ml-2">{formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true, locale: vi })}</span></div>{(feedback.authorId === currentUserId || currentUserRole === 'ADMIN') && <button type="button" onClick={() => remove(feedback.id)} title="Xóa phản hồi" className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>}</div><div className="text-sm text-slate-600 break-words mt-2"><RichTextViewer content={feedback.content} /></div></div>
              </article>)}
          </div>
          <footer className="shrink-0 p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70">
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            <RichEditor content={content} onChange={setContent} placeholder="Viết góp ý, câu hỏi hoặc đề xuất..." minHeight="120px" maxHeight="28vh" />
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3"><p className="hidden sm:block text-[11px] text-slate-400">Hỗ trợ tiêu đề, danh sách, liên kết, trích dẫn, mã và hình ảnh.</p><div className="flex items-center justify-end gap-3 ml-auto"><span className={`text-[11px] ${textLength(content) > 10000 ? 'text-red-500' : 'text-slate-400'}`}>{textLength(content)}/10.000</span><button type="button" onClick={submit} disabled={!hasRichContent(content) || submitting || textLength(content) > 10000 || content.length > 20000} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Gửi phản hồi</button></div></div>
          </footer>
        </motion.section>
      </div>}
    </AnimatePresence>, document.body)}
  </>
}
