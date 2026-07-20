'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { deleteReference } from '@/app/actions'
import {
  BookOpen, Search, Trash2, ExternalLink, FileText,
  ChevronDown, ChevronUp, Filter, X, BarChart3
} from 'lucide-react'

const FORMAT_COLORS: Record<string, string> = {
  '.pdf':  'bg-red-50 text-red-600 border-red-100',
  '.md':   'bg-emerald-50 text-emerald-700 border-emerald-100',
  '.html': 'bg-amber-50 text-amber-700 border-amber-100',
  '.docx': 'bg-blue-50 text-blue-600 border-blue-100',
}
const CATEGORY_COLORS: Record<string, string> = {
  'question_evaluate': 'bg-navy-50 text-navy-700',
  'question_generate': 'bg-sky-50 text-sky-700',
  'analyze_source':    'bg-indigo-50 text-indigo-700',
  'solution_report':   'bg-teal-50 text-teal-700',
}

export default function ReferencesClient({ reports, totalRefs, totalReports, isAdmin }: {
  reports: any[]
  totalRefs: number
  totalReports: number
  isAdmin: boolean
}) {
  const [search,   setSearch]   = useState('')
  const [catFilter, setCatFilter] = useState('ALL')
  const [expanded, setExpanded]  = useState<Set<number>>(new Set())
  const [deleting, setDeleting]  = useState<number | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(reports.map(r => r.category))).sort(),
    [reports]
  )

  const filtered = useMemo(() => reports.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = r.title.toLowerCase().includes(q) ||
      r.references.some((ref: any) => ref.sourceUrl.toLowerCase().includes(q) || (ref.description || '').toLowerCase().includes(q))
    const matchCat = catFilter === 'ALL' || r.category === catFilter
    return matchSearch && matchCat
  }), [reports, search, catFilter])

  const totalFilteredRefs = filtered.reduce((acc: number, r: any) => acc + r.references.length, 0)

  const toggle = (id: number) => setExpanded(prev => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const handleDelete = async (refId: number) => {
    setDeleting(refId)
    await deleteReference(refId)
    setDeleting(null)
  }

  return (
    <div className="w-[95%] lg:w-[90%] max-w-7xl mx-auto pt-4 pb-24 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-navy-300 text-xs font-semibold uppercase tracking-widest mb-2">Hệ thống quản lý</p>
            <h1 className="text-3xl font-extrabold text-white mb-2">Tài liệu Tham khảo</h1>
            <p className="text-navy-200/80 text-sm max-w-lg">Tổng hợp toàn bộ nguồn tài liệu khoa học được đính kèm trong các báo cáo nghiên cứu.</p>
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap">
            {[
              { value: totalRefs, label: 'Tổng tài liệu' },
              { value: reports.length, label: 'Báo cáo có link' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[100px]">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-navy-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên báo cáo hoặc URL..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 shadow-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="bg-white border border-slate-200 text-sm text-slate-700 rounded-2xl px-4 py-3 outline-none shadow-sm cursor-pointer w-full sm:w-auto">
          <option value="ALL">Tất cả danh mục</option>
          {categories.map(c => <option key={c} value={c}>{(c as string).replace(/_/g, ' ')}</option>)}
        </select>
        <p className="text-sm text-slate-500 whitespace-nowrap">{totalFilteredRefs} tài liệu</p>
      </motion.div>

      {/* Reports list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Không tìm thấy tài liệu nào phù hợp</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report: any, ri: number) => {
            const isOpen = expanded.has(report.id)
            const fmtKey = report.format?.toLowerCase() || ''
            const catKey = report.category?.toLowerCase() || ''
            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.04 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Report header — clickable to expand */}
                <button onClick={() => toggle(report.id)} className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-navy-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${FORMAT_COLORS[fmtKey] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{report.format?.toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CATEGORY_COLORS[catKey] || 'bg-slate-100 text-slate-600'}`}>{report.category?.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="font-semibold text-slate-800 truncate text-sm">{report.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{report.uploader.username} · {format(new Date(report.createdAt), 'dd MMM yyyy, HH:mm', { locale: vi })}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-navy-600 bg-navy-50 px-2.5 py-1 rounded-full border border-navy-100">
                      {report.references.length} link
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* References */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-6 pb-4 space-y-2 border-t border-slate-50">
                        {report.references.map((ref: any) => (
                          <div key={ref.id} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-navy-400 mt-2 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <a href={ref.sourceUrl} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-navy-600 hover:text-navy-800 hover:underline break-all flex items-start gap-1.5 group/link">
                                <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60 group-hover/link:opacity-100" />
                                {ref.sourceUrl}
                              </a>
                              {ref.description && <p className="text-xs text-slate-400 mt-1">{ref.description}</p>}
                            </div>
                            {isAdmin && (
                              <button onClick={() => handleDelete(ref.id)} disabled={deleting === ref.id}
                                className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                {deleting === ref.id ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
