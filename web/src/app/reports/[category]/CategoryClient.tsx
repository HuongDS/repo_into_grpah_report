'use client'

import { format } from 'date-fns'
import { ExternalLink, BookOpen, Clock, FolderOpen, Search, Filter, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { useState, useMemo } from 'react'
import DocumentViewer from '@/components/DocumentViewer'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function CategoryClient({ categoryName, reports }: { categoryName: string, reports: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [formatFilter, setFormatFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  // State for Document Viewer
  const [viewReport, setViewReport] = useState<any>(null)

  // Filter and Search Logic
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.uploader.username.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFormat = formatFilter === 'ALL' || report.format.toUpperCase() === formatFilter
      return matchesSearch && matchesFormat
    })
  }, [reports, searchQuery, formatFilter])

  // Pagination Logic
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE) || 1
  const paginatedReports = filteredReports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Reset page when filters change
  useMemo(() => { setCurrentPage(1) }, [searchQuery, formatFilter])

  return (
    <div className="w-[95%] lg:w-[90%] max-w-7xl mx-auto space-y-8 pt-6 pb-20">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-blue-100 font-medium mb-1 uppercase tracking-wider text-sm">Danh mục báo cáo</p>
              <h1 className="text-3xl md:text-4xl font-bold">{categoryName.replace('_', ' ')}</h1>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl text-center min-w-[140px] shrink-0">
            <p className="text-3xl font-bold">{reports.length}</p>
            <p className="text-blue-100 text-sm font-medium mt-1">Tổng báo cáo</p>
          </div>
        </div>
      </motion.div>

      {/* Toolbar: Search & Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
      >
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm báo cáo, người đăng..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả định dạng</option>
              <option value=".PDF">.PDF</option>
              <option value=".MD">.MD</option>
              <option value=".HTML">.HTML</option>
              <option value=".DOCX">.DOCX</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Report List */}
      {paginatedReports.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy báo cáo</h3>
          <p className="text-slate-500 max-w-md">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc định dạng để xem các kết quả khác.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-6"
        >
          {paginatedReports.map(report => (
            <motion.div 
              key={report.id} 
              variants={item}
              whileHover={{ scale: 1.02 }}
              className="group bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all flex flex-col h-full cursor-pointer"
              onClick={() => setViewReport(report)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-wide border border-blue-100/50">
                    {report.format}
                  </span>
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    {format(new Date(report.createdAt), 'dd/MM/yyyy')}
                  </span>
                </div>
                
                <h3 className="font-bold text-xl md:text-2xl text-slate-800 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
                  {report.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                    {report.uploader.username.charAt(0)}
                  </div>
                  <span>{report.uploader.username}</span>
                </div>
              </div>

              {report.references.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Tham khảo ({report.references.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {report.references.slice(0, 2).map((ref: any, idx: number) => (
                      <span key={ref.id} className="text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-500 truncate max-w-[150px]" title={ref.sourceUrl}>
                        Link {idx + 1}
                      </span>
                    ))}
                    {report.references.length > 2 && (
                      <span className="text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-500">
                        +{report.references.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 pt-8"
        >
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-medium text-sm transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Document Viewer Modal */}
      {viewReport && (
        <DocumentViewer
          isOpen={!!viewReport}
          onClose={() => setViewReport(null)}
          url={viewReport.url}
          format={viewReport.format}
          title={viewReport.title}
        />
      )}
    </div>
  )
}
