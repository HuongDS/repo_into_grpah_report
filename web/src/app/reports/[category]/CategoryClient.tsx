'use client'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  BookOpen, FolderOpen, Search, SlidersHorizontal,
  ChevronLeft, ChevronRight, User, Eye, X, Pencil,
} from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import DocumentViewer from '@/components/DocumentViewer'

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } }
}

const FORMAT_COLORS: Record<string, string> = {
  '.pdf':  'bg-red-50 text-red-600 border-red-100',
  '.md':   'bg-emerald-50 text-emerald-700 border-emerald-100',
  '.html': 'bg-amber-50 text-amber-700 border-amber-100',
  '.docx': 'bg-blue-50 text-blue-600 border-blue-100',
}

const ITEMS_PER_PAGE = 8

export default function CategoryClient({
  categoryName,
  reports,
  currentUserId,
  currentUserRole,
}: {
  categoryName: string
  reports: any[]
  currentUserId: number | null
  currentUserRole: string
}) {
  const [searchQuery,    setSearchQuery]    = useState('')
  const [formatFilter,   setFormatFilter]   = useState('ALL')
  const [uploaderFilter, setUploaderFilter] = useState('ALL')
  const [sortBy,         setSortBy]         = useState<'newest' | 'oldest'>('newest')
  const [showFilters,    setShowFilters]    = useState(false)
  const [currentPage,    setCurrentPage]    = useState(1)
  const [viewReport,     setViewReport]     = useState<any>(null)

  const uploaders = useMemo(
    () => Array.from(new Set(reports.map(r => r.uploader.username))).sort(),
    [reports]
  )

  const activeFilterCount = [
    formatFilter !== 'ALL', uploaderFilter !== 'ALL', sortBy !== 'newest',
  ].filter(Boolean).length

  const filteredReports = useMemo(() => {
    let result = reports.filter(r => {
      const q = searchQuery.toLowerCase()
      const matchSearch   = r.title.toLowerCase().includes(q) || r.uploader.username.toLowerCase().includes(q)
      const matchFormat   = formatFilter   === 'ALL' || r.format.toLowerCase() === formatFilter.toLowerCase()
      const matchUploader = uploaderFilter === 'ALL' || r.uploader.username === uploaderFilter
      return matchSearch && matchFormat && matchUploader
    })
    if (sortBy === 'oldest') result = [...result].reverse()
    return result
  }, [reports, searchQuery, formatFilter, uploaderFilter, sortBy])

  useEffect(() => { setCurrentPage(1) }, [searchQuery, formatFilter, uploaderFilter, sortBy])

  const totalPages       = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE))
  const paginatedReports = filteredReports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleClearFilters = () => {
    setSearchQuery(''); setFormatFilter('ALL'); setUploaderFilter('ALL'); setSortBy('newest')
  }

  const canEdit = (report: any) => currentUserId === report.uploaderId

  return (
    <div className="w-[95%] lg:w-[90%] max-w-7xl mx-auto pt-4 pb-24 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700" />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-navy-950/30 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 px-8 py-10 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center ring-1 ring-white/20 shrink-0">
              <FolderOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-navy-300 text-xs font-semibold uppercase tracking-widest mb-1">Danh mục báo cáo</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{categoryName}</h1>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            {[
              { value: reports.length, label: 'Tổng' },
              { value: uploaders.length, label: 'Người đăng' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-navy-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Tìm tiêu đề, người đăng..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 shadow-sm placeholder-slate-400 transition-all" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-2xl border font-semibold text-sm transition-all shadow-sm whitespace-nowrap ${
              showFilters ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-slate-600 border-slate-200 hover:border-navy-300 hover:text-navy-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Định dạng</label>
                  <div className="flex flex-wrap gap-2">
                    {['ALL', '.pdf', '.md', '.html', '.docx'].map(f => (
                      <button key={f} onClick={() => setFormatFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${formatFilter === f ? 'bg-navy-700 text-white border-navy-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-navy-300'}`}>
                        {f === 'ALL' ? 'Tất cả' : f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><User className="w-3 h-3" /> Người đăng</label>
                  <select value={uploaderFilter} onChange={e => setUploaderFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-navy-400 cursor-pointer">
                    <option value="ALL">Tất cả người đăng</option>
                    {uploaders.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sắp xếp</label>
                  <div className="flex gap-2">
                    {[{ value: 'newest', label: 'Mới nhất' }, { value: 'oldest', label: 'Cũ nhất' }].map(opt => (
                      <button key={opt.value} onClick={() => setSortBy(opt.value as any)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${sortBy === opt.value ? 'bg-navy-700 text-white border-navy-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-navy-300'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <div className="sm:col-span-3 flex justify-end pt-2 border-t border-slate-100">
                    <button onClick={handleClearFilters} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" /> Xóa tất cả
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-sm text-slate-400 px-1">
          <span className="font-semibold text-slate-600">{filteredReports.length}</span> kết quả
          {filteredReports.length !== reports.length && <span> (trong {reports.length} tổng)</span>}
        </p>
      </motion.div>

      {/* Report grid */}
      {paginatedReports.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-5">
            <Search className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs">Thử thay đổi từ khóa hoặc bộ lọc.</p>
          <button onClick={handleClearFilters} className="px-5 py-2.5 bg-navy-700 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-all">
            Xóa bộ lọc
          </button>
        </motion.div>
      ) : (
        <motion.div key={`${currentPage}-${formatFilter}-${uploaderFilter}-${sortBy}`}
          variants={container} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedReports.map(report => {
            const fmtKey = report.format?.toLowerCase() || ''
            const badge  = FORMAT_COLORS[fmtKey] || 'bg-slate-100 text-slate-600 border-slate-200'
            const isOwner = canEdit(report)
            return (
              <motion.div key={report.id} variants={item} whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="group bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-navy-900/8 hover:border-navy-100 transition-all flex flex-col gap-4">
                {/* Card top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${badge}`}>{report.format}</span>
                    <span className="text-xs text-slate-400 font-medium">{format(new Date(report.createdAt), 'dd MMM yyyy', { locale: vi })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isOwner && (
                      <Link href={`/admin/edit/${report.id}`} onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-navy-600 hover:bg-navy-50 transition-all opacity-0 group-hover:opacity-100"
                        title="Chỉnh sửa">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-navy-50 group-hover:border-navy-100 flex items-center justify-center transition-all cursor-pointer" onClick={() => setViewReport(report)}>
                      <Eye className="w-4 h-4 text-slate-300 group-hover:text-navy-500 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 onClick={() => setViewReport(report)}
                  className="font-bold text-base md:text-lg text-slate-800 group-hover:text-navy-700 transition-colors leading-snug line-clamp-2 flex-1 cursor-pointer">
                  {report.title}
                </h3>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                      {report.uploader.username.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{report.uploader.username}</span>
                  </div>
                  {report.references.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{report.references.length} nguồn</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-navy-600 hover:border-navy-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
            <button key={pg} onClick={() => setCurrentPage(pg)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${pg === currentPage ? 'bg-navy-700 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-navy-200 hover:text-navy-600'}`}>
              {pg}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-navy-600 hover:border-navy-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Document Viewer */}
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
