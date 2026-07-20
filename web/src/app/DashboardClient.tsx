'use client'

import { format } from 'date-fns'
import { FileText, Clock, ExternalLink, Activity, CalendarDays } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import CalendarFilter from '@/components/CalendarFilter'

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

export default function DashboardClient({ 
  selectedDateStr, 
  reports, 
  updateLogs 
}: { 
  selectedDateStr?: string, 
  reports: any[], 
  updateLogs: any[] 
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-6">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Tổng quan Báo cáo</h1>
            <p className="text-blue-100 max-w-xl">Theo dõi và quản lý toàn bộ các báo cáo khoa học, tiến độ và cập nhật mới nhất từ hệ thống Repo Into Graph.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng số cập nhật</p>
              <p className="text-2xl font-bold">{updateLogs.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Calendar & Updates */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CalendarDays className="w-5 h-5" /></div>
              <h2 className="text-lg font-bold text-slate-800">Bộ lọc Thời gian</h2>
            </div>
            <CalendarFilter selectedDateStr={selectedDateStr} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Activity className="w-5 h-5" /></div>
              <h2 className="text-lg font-bold text-slate-800">Nhật ký Cập nhật</h2>
            </div>
            {updateLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Chưa có nhật ký cập nhật nào.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {updateLogs.map(log => (
                  <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-indigo-100 last:border-0 last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 bg-indigo-500 rounded-full ring-4 ring-white" />
                    <p className="text-xs font-semibold text-indigo-600 mb-1">{format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{log.description}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Reports */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText className="w-5 h-5" /></div>
            <h2 className="text-xl font-bold text-slate-800">
              {selectedDateStr ? `Báo cáo ngày ${format(new Date(selectedDateStr), 'dd/MM/yyyy')}` : 'Báo cáo mới nhất'}
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Không tìm thấy báo cáo nào phù hợp.</p>
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {reports.map(report => (
                <motion.div 
                  key={report.id} 
                  variants={item}
                  whileHover={{ scale: 1.01 }}
                  className="group bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                          {report.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                          {report.format}
                        </span>
                      </div>
                      <a href={report.url} target="_blank" rel="noopener noreferrer" className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        {report.title}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Tải lên bởi: <span className="text-slate-700">{report.uploader.username}</span></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
