'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, PinOff, Plus, FileText, Eye, LayoutTemplate, X, BookOpen, Clock } from 'lucide-react'
import { pinReport, unpinReport } from '@/app/actions'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import DocumentViewer from '@/components/DocumentViewer'

const SECTIONS = [
  { id: 'Question_Generate', title: 'Generate câu hỏi', theme: 'sky' },
  { id: 'Question_Evaluate', title: 'Đánh giá câu hỏi', theme: 'navy' },
  { id: 'Analyze_Source',    title: 'Analyze Source',   theme: 'indigo' },
  { id: 'Solution_Report',   title: 'Solution',         theme: 'teal' },
]

const SLOT_TYPES = [
  { id: 'DONE', label: 'Tiến độ (Đã làm)', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'BUG',  label: 'Vấn đề (Bug)',     icon: AlertCircle,  color: 'text-red-500', bg: 'bg-red-50' },
]

export default function OverviewClient({
  pinnedReports,
  allReports,
  currentUserId,
  currentUserRole
}: {
  pinnedReports: any[]
  allReports: any[]
  currentUserId: number
  currentUserRole: string
}) {
  const [viewReport, setViewReport] = useState<any>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTarget, setModalTarget] = useState<{ category: string, type: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleOpenModal = (category: string, type: string) => {
    setModalTarget({ category, type })
    setSearchQuery('')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handlePin = async (reportId: number) => {
    if (!modalTarget) return
    setIsSubmitting(true)
    setErrorMsg('')
    const res = await pinReport(modalTarget.category, modalTarget.type, reportId)
    setIsSubmitting(false)
    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setIsModalOpen(false)
    }
  }

  const handleUnpin = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn gỡ báo cáo này khỏi tổng quan?')) {
      const res = await unpinReport(id)
      if (res.error) alert(res.error)
    }
  }

  const availableReports = allReports.filter(r => 
    modalTarget && r.category === modalTarget.category && 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center shadow-lg shadow-navy-900/20 shrink-0">
          <LayoutTemplate className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Tổng quan dự án</h1>
          <p className="text-slate-500 font-medium mt-1">Theo dõi tiến độ và các vấn đề tồn đọng của từng hạng mục.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {SECTIONS.map(section => (
          <div key={section.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className={`px-6 py-4 border-b border-slate-100 bg-${section.theme}-50/50`}>
              <h2 className={`text-lg font-bold text-${section.theme}-700 flex items-center gap-2`}>
                <div className={`w-3 h-3 rounded-full bg-${section.theme}-500 shadow-sm`} />
                {section.title}
              </h2>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-6">
              {SLOT_TYPES.map(slot => {
                const pinned = pinnedReports.find(p => p.category === section.id && p.type === slot.id)
                const Icon = slot.icon
                return (
                  <div key={slot.id} className="flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wide">
                      <Icon className={`w-4 h-4 ${slot.color}`} />
                      {slot.label}
                    </h3>

                    {pinned ? (
                      <div className="group relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-navy-200 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewReport(pinned.report)}>
                            <h4 className="font-bold text-slate-800 group-hover:text-navy-600 transition-colors line-clamp-2 mb-2">
                              {pinned.report.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                              <span className="flex items-center gap-1.5 text-slate-600">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-[9px] uppercase">
                                  {pinned.report.uploader.username.charAt(0)}
                                </div>
                                {pinned.report.uploader.username}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(pinned.report.createdAt), 'dd/MM/yyyy HH:mm')}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewReport(pinned.report)} className="p-2 bg-navy-50 text-navy-600 rounded-xl hover:bg-navy-100 transition-colors" title="Xem chi tiết">
                              <Eye className="w-4 h-4" />
                            </button>
                            {(currentUserRole === 'ADMIN' || pinned.report.uploaderId === currentUserId) && (
                              <button onClick={() => handleUnpin(pinned.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Gỡ ghim">
                                <PinOff className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => handleOpenModal(section.id, slot.id)}
                        className={`w-full h-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-navy-500 hover:border-navy-300 hover:bg-navy-50/50 transition-all`}>
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold">Ghim báo cáo</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Select Report Modal */}
      <AnimatePresence>
        {isModalOpen && modalTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">
                  Chọn báo cáo cho <span className="text-navy-600">{SECTIONS.find(s => s.id === modalTarget.category)?.title}</span> - <span className={SLOT_TYPES.find(t => t.id === modalTarget.type)?.color}>{SLOT_TYPES.find(t => t.id === modalTarget.type)?.label}</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 border-b border-slate-100">
                <input type="text" placeholder="Tìm kiếm tên báo cáo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none text-sm" />
                {errorMsg && <p className="text-red-500 text-sm font-semibold mt-2">{errorMsg}</p>}
              </div>

              <div className="overflow-y-auto flex-1 p-4 space-y-2 custom-scrollbar">
                {availableReports.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm">Không tìm thấy báo cáo nào trong danh mục này.</p>
                ) : (
                  availableReports.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-navy-200 hover:bg-navy-50/30 transition-colors group">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-slate-800 text-sm mb-1">{r.title}</p>
                        <p className="text-xs text-slate-400 font-medium">Bởi {r.uploader.username} vào {format(new Date(r.createdAt), 'dd/MM/yyyy')}</p>
                      </div>
                      <button disabled={isSubmitting} onClick={() => handlePin(r.id)} className="px-4 py-2 bg-navy-600 text-white text-xs font-bold rounded-xl hover:bg-navy-700 disabled:opacity-50 transition-colors shadow-sm">
                        Chọn ghim
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewReport && (
          <DocumentViewer
            isOpen={!!viewReport}
            onClose={() => setViewReport(null)}
            url={viewReport.url}
            format={viewReport.format}
            title={viewReport.title}
            uploader={viewReport.uploader?.username}
            uploadDate={format(new Date(viewReport.createdAt), 'dd/MM/yyyy HH:mm')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
