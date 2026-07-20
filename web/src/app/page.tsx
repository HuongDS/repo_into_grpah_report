import { prisma } from '@/lib/prisma'
import { CalendarFilter } from '@/components/CalendarFilter'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { FileText, Clock, ExternalLink, Activity } from 'lucide-react'

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const selectedDateStr = resolvedSearchParams.date;
  
  // Fetch reports based on selected date
  const dateFilter = selectedDateStr ? {
    createdAt: {
      gte: new Date(`${selectedDateStr}T00:00:00.000Z`),
      lt: new Date(`${selectedDateStr}T23:59:59.999Z`)
    }
  } : {}

  const reports = await prisma.report.findMany({
    where: dateFilter,
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { uploader: true }
  })

  const updates = await prisma.updateLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  // Get all dates that have reports for calendar dots
  const allReports = await prisma.report.findMany({
    select: { createdAt: true }
  })
  const activeDates = allReports.map(r => format(r.createdAt, 'yyyy-MM-dd'))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        
        {/* Intro Section */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-4">Repo Into Graph Project</h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-2xl">
              Hệ thống đọc mã nguồn từ repository, sinh ra đồ thị (graph) và tự động tạo câu hỏi về luồng nghiệp vụ của dự án cho sinh viên. Giúp hỗ trợ giảng viên trong quá trình chấm bài và đánh giá một cách minh bạch, hiệu quả.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-10 pointer-events-none">
            <Activity className="w-96 h-96" />
          </div>
        </div>

        {/* Reports List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              {selectedDateStr ? `Báo cáo ngày ${format(parseISO(selectedDateStr), 'dd/MM/yyyy')}` : 'Báo cáo mới nhất'}
            </h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Không có báo cáo nào trong khoảng thời gian này.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {reports.map(report => (
                  <li key={report.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <a href={report.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline flex items-center gap-1.5 text-lg">
                          {report.title}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                          <span className="bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">{report.category}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {format(report.createdAt, 'dd/MM/yyyy HH:mm')}</span>
                          <span>Bởi: {report.uploader.username}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase tracking-wider">{report.format}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Calendar */}
        <CalendarFilter activeDates={activeDates} />

        {/* Quick Updates */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Cập nhật mới nhất
          </h3>
          {updates.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có cập nhật nào.</p>
          ) : (
            <ul className="space-y-4">
              {updates.map(update => (
                <li key={update.id} className="relative pl-4 border-l-2 border-indigo-100 pb-2">
                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-1.5"></div>
                  <p className="text-sm text-slate-700 leading-snug">{update.description}</p>
                  <span className="text-xs text-slate-400 mt-1 block">{format(update.createdAt, 'dd/MM/yyyy')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
