'use client'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  FileText, Clock, Activity, CalendarDays,
  Search, ChevronLeft, ChevronRight, Eye,
  TrendingUp, Users, Layers, SlidersHorizontal, X, User
} from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import CalendarFilter from '@/components/CalendarFilter'
import DocumentViewer from '@/components/DocumentViewer'

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
}
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } }
}

const FORMAT_COLORS: Record<string, string> = {
  '.pdf':  'bg-red-50 text-red-600 border-red-100',
  '.md':   'bg-emerald-50 text-emerald-700 border-emerald-100',
  '.html': 'bg-amber-50 text-amber-700 border-amber-100',
  '.docx': 'bg-blue-50 text-blue-600 border-blue-100',
}

const CATEGORY_COLORS: Record<string, string> = {
  'question_evaluate': 'bg-violet-50 text-violet-700 border-violet-100',
  'question_generate': 'bg-sky-50 text-sky-700 border-sky-100',
  'solution_report':   'bg-teal-50 text-teal-700 border-teal-100',
}

const ITEMS_PER_PAGE = 5

export default function DashboardClient({
  selectedDateStr,
  reports,
  updateLogs,
}: {
  selectedDateStr?: string
  reports: any[]
  updateLogs: any[]
}) {
  const [searchQuery, setSearchQuery]     = useState('')
  const [formatFilter, setFormatFilter]   = useState('ALL')
  const [uploaderFilter, setUploaderFilter] = useState('ALL')
  const [sortBy, setSortBy]               = useState<'newest' | 'oldest'>('newest')
  const [showFilters, setShowFilters]     = useState(false)
  const [currentPage, setCurrentPage]     = useState(1)
  const [viewReport, setViewReport]       = useState<any>(null)

  // Derive unique uploaders
  const uploaders = useMemo(
    () => Array.from(new Set(reports.map(r => r.uploader.username))).sort(),
    [reports]
  )

  const activeFilterCount = [
    formatFilter !== 'ALL',
    uploaderFilter !== 'ALL',
    sortBy !== 'newest',
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

  const totalPages       = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE))
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => { setCurrentPage(1) }, [searchQuery, formatFilter, uploaderFilter, sortBy])

  const handleClearFilters = () => {
    setSearchQuery(''); setFormatFilter('ALL'); setUploaderFilter('ALL'); setSortBy('newest')
  }

  return (
    <div className="w-[95%] lg:w-[90%] max-w-7xl mx-auto pt-4 pb-24 space-y-6">

      {/* ── HERO HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-2xl" />

        <div className="relative z-10 px-8 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">Repo Into Graph · Hệ thống</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">Tổng quan Báo cáo</h1>
              <p className="text-blue-200/80 text-sm max-w-lg">Theo dõi và quản lý toàn bộ báo cáo khoa học, tiến độ nghiên cứu và cập nhật mới nhất từ hệ thống.</p>
            </div>

            {/* Stats */}
            <div className="flex gap-3 shrink-0 flex-wrap">
              {[
                { icon: FileText,   value: reports.length,     label: 'Báo cáo', color: 'from-blue-500 to-blue-600' },
                { icon: TrendingUp, value: updateLogs.length,  label: 'Cập nhật', color: 'from-indigo-500 to-indigo-600' },
                { icon: Users,      value: uploaders.length,   label: 'Người đăng', color: 'from-violet-500 to-violet-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-center min-w-[90px]">
                  <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-blue-200 text-xs font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-4 space-y-5">

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Lọc theo ngày</h2>
            </div>
            <CalendarFilter selectedDateStr={selectedDateStr} />
          </motion.div>

          {/* Update Logs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Nhật ký Cập nhật</h2>
              </div>
              {updateLogs.length > 0 && (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {updateLogs.length}
                </span>
              )}
            </div>
            {updateLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">Chưa có nhật ký nào.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {updateLogs.map((log, idx) => (
                  <div key={log.id} className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0 ring-2 ring-white" />
                      {idx < updateLogs.length - 1 && (
                        <div className="w-px flex-1 bg-indigo-100 mt-1 min-h-[20px]" />
                      )}
                    </div>
                    <div className="pb-3 flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-indigo-500 mb-1">
                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                        {log.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT: REPORTS */}
        <div className="lg:col-span-8 space-y-5">

          {/* Report Header + Search/Filter */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedDateStr
                    ? `Báo cáo ${format(new Date(selectedDateStr), 'dd/MM/yyyy')}`
                    : 'Báo cáo mới nhất'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {filteredReports.length} / {reports.length} báo cáo
                </p>
              </div>

              <div className="flex gap-2 items-center">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
                  />
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className={`relative p-2.5 rounded-xl border font-semibold text-sm transition-all shadow-sm ${
                    showFilters
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm">
                    {/* Format */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Định dạng</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['ALL', '.pdf', '.md', '.html'].map(f => (
                          <button
                            key={f}
                            onClick={() => setFormatFilter(f)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                              formatFilter === f
                                ? 'bg-violet-600 text-white border-violet-600'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-200'
                            }`}
                          >
                            {f === 'ALL' ? 'Tất cả' : f.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Uploader */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <User className="w-3 h-3" /> Người đăng
                      </label>
                      <select
                        value={uploaderFilter}
                        onChange={e => setUploaderFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-violet-400 cursor-pointer"
                      >
                        <option value="ALL">Tất cả</option>
                        {uploaders.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sắp xếp</label>
                      <div className="flex gap-2">
                        {[{ value: 'newest', label: 'Mới nhất' }, { value: 'oldest', label: 'Cũ nhất' }].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value as any)}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              sortBy === opt.value
                                ? 'bg-violet-600 text-white border-violet-600'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {activeFilterCount > 0 && (
                      <div className="sm:col-span-3 flex justify-end pt-2 border-t border-slate-100">
                        <button onClick={handleClearFilters} className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Xóa bộ lọc
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Report List */}
          {paginatedReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                <Search className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Không tìm thấy báo cáo nào.</p>
              {activeFilterCount > 0 && (
                <button onClick={handleClearFilters} className="text-xs text-violet-600 font-semibold hover:underline">
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <motion.div
              key={`${currentPage}-${formatFilter}-${uploaderFilter}-${sortBy}`}
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {paginatedReports.map(report => {
                const fmtKey     = report.format?.toLowerCase() || ''
                const fmtBadge   = FORMAT_COLORS[fmtKey] || 'bg-slate-100 text-slate-600 border-slate-200'
                const catKey     = report.category?.toLowerCase() || ''
                const catBadge   = CATEGORY_COLORS[catKey] || 'bg-slate-100 text-slate-600 border-slate-200'

                return (
                  <motion.div
                    key={report.id}
                    variants={item}
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    onClick={() => setViewReport(report)}
                    className="group bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-violet-50 group-hover:border-violet-100 flex items-center justify-center shrink-0 transition-all">
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${catBadge}`}>
                            {report.category?.replace(/_/g, ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${fmtBadge}`}>
                            {report.format}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-slate-800 group-hover:text-violet-700 transition-colors truncate">
                          {report.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(report.createdAt), 'dd MMM yyyy HH:mm', { locale: vi })}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white text-[8px] font-bold uppercase">
                              {report.uploader.username.charAt(0)}
                            </div>
                            {report.uploader.username}
                          </span>
                        </div>
                      </div>

                      {/* View arrow */}
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-violet-500" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-xl text-sm font-bold transition-all ${
                    pg === currentPage
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-violet-200 hover:text-violet-600'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

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
