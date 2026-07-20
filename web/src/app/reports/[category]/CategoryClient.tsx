'use client'

import { format } from 'date-fns'
import { ExternalLink, BookOpen, Clock, FolderOpen } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

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
  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-blue-100 font-medium mb-1 uppercase tracking-wider text-sm">Danh mục báo cáo</p>
              <h1 className="text-3xl md:text-4xl font-bold">{categoryName}</h1>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl text-center min-w-[140px]">
            <p className="text-3xl font-bold">{reports.length}</p>
            <p className="text-blue-100 text-sm font-medium mt-1">Báo cáo</p>
          </div>
        </div>
      </motion.div>

      {reports.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có dữ liệu</h3>
          <p className="text-slate-500">Chưa có báo cáo nào được tải lên trong danh mục này.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6"
        >
          {reports.map(report => (
            <motion.div 
              key={report.id} 
              variants={item}
              whileHover={{ scale: 1.01 }}
              className="group bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
                <div className="flex-1">
                  <a href={report.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold text-xl md:text-2xl text-slate-800 group-hover:text-blue-600 transition-colors mb-3">
                    {report.title}
                    <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Người đăng: <span className="text-slate-700">{report.uploader.username}</span></span>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg uppercase tracking-wide">
                      {report.format}
                    </span>
                  </div>
                </div>
              </div>

              {report.references.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" /> Nguồn bài báo tham khảo
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {report.references.map((ref: any) => (
                      <li key={ref.id}>
                        <a href={ref.sourceUrl} target="_blank" rel="noopener noreferrer" className="block p-3 bg-slate-50 hover:bg-blue-50 rounded-xl text-sm text-blue-600 hover:text-blue-700 hover:underline truncate transition-colors border border-slate-100 hover:border-blue-100">
                          {ref.sourceUrl}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
