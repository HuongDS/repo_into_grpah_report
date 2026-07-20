'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { updateReport, deleteReport } from '@/app/actions'
import { Plus, Trash2, Save, ArrowLeft, AlertTriangle, BookOpen, FileText, Tag } from 'lucide-react'

interface Ref { id?: number; sourceUrl: string; description?: string }

export default function EditReportClient({ report }: { report: any }) {
  const router = useRouter()
  const [title, setTitle] = useState(report.title)
  const [refs,  setRefs]  = useState<Ref[]>(
    report.references.length > 0
      ? report.references.map((r: any) => ({ id: r.id, sourceUrl: r.sourceUrl, description: r.description || '' }))
      : [{ sourceUrl: '', description: '' }]
  )
  const [saving,  setSaving]  = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const addRef    = () => setRefs(p => [...p, { sourceUrl: '', description: '' }])
  const removeRef = (i: number) => setRefs(p => p.filter((_, idx) => idx !== i))
  const updateRef = (i: number, field: keyof Ref, val: string) =>
    setRefs(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const handleSave = async () => {
    if (!title.trim()) { setMessage({ type: 'error', text: 'Tiêu đề không được để trống' }); return }
    setSaving(true)
    const res = await updateReport(report.id, title, refs.filter(r => r.sourceUrl.trim()))
    setSaving(false)
    if (res?.error) {
      setMessage({ type: 'error', text: res.error })
    } else {
      setMessage({ type: 'success', text: 'Lưu thành công!' })
      setTimeout(() => router.push(`/reports/${report.category}`), 1200)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const res = await deleteReport(report.id)
    setDeleting(false)
    if (res?.error) {
      setMessage({ type: 'error', text: res.error })
      setShowDeleteConfirm(false)
    } else {
      router.push(`/reports/${report.category}`)
    }
  }

  return (
    <div className="w-[95%] lg:w-[80%] max-w-3xl mx-auto pt-4 pb-20">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 mb-5 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </button>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 p-8 text-white">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-navy-200 text-xs font-semibold uppercase tracking-widest mb-1">Chỉnh sửa báo cáo</p>
              <h1 className="text-2xl font-bold line-clamp-1">{report.title}</h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-6 px-5 py-4 rounded-2xl font-medium text-sm flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">

        {/* Info read-only */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3 h-3" /> Danh mục
            </p>
            <p className="text-sm font-semibold text-slate-700">{report.category.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Định dạng</p>
            <p className="text-sm font-semibold text-slate-700">{report.format.toUpperCase()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Người đăng</p>
            <p className="text-sm font-semibold text-slate-700">{report.uploader.username}</p>
          </div>
        </div>

        {/* Title edit */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-3">Tiêu đề báo cáo</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800 font-medium"
            placeholder="Nhập tiêu đề báo cáo..."
          />
        </div>

        {/* References */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-navy-600" />
              Nguồn tài liệu tham khảo
            </h3>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border">{refs.filter(r => r.sourceUrl.trim()).length} link</span>
          </div>

          <div className="space-y-4">
            {refs.map((ref, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      value={ref.sourceUrl}
                      onChange={e => updateRef(i, 'sourceUrl', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-sm"
                      placeholder="https://..."
                    />
                    <input
                      type="text"
                      value={ref.description || ''}
                      onChange={e => updateRef(i, 'description', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 text-xs text-slate-500"
                      placeholder="Mô tả ngắn gọn về tài liệu này (tùy chọn)"
                    />
                  </div>
                  {refs.length > 1 && (
                    <button onClick={() => removeRef(i)} className="mt-1 p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <button onClick={addRef} className="mt-4 flex items-center gap-2 text-sm font-semibold text-navy-600 hover:text-navy-700 px-4 py-2 bg-navy-50 hover:bg-navy-100 rounded-xl transition-all">
            <Plus className="w-4 h-4" /> Thêm link tham khảo
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3.5 bg-navy-700 hover:bg-navy-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-navy-900/20 disabled:opacity-60 transition-all"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save className="w-5 h-5" /> Lưu thay đổi</>
            )}
          </motion.button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold flex items-center gap-2 border border-red-100 transition-all"
          >
            <Trash2 className="w-5 h-5" /> Xóa
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa báo cáo</h3>
              <p className="text-slate-500 text-sm mb-6">Hành động này <strong>không thể hoàn tác</strong>. Báo cáo <strong>"{report.title}"</strong> và toàn bộ tài liệu tham khảo sẽ bị xóa vĩnh viễn.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all">Hủy</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
                  {deleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Xóa vĩnh viễn'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
