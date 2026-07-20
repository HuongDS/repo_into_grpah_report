import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ExternalLink, BookOpen, Clock } from 'lucide-react'

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const category = resolvedParams.category;

  const reports = await prisma.report.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
    include: { uploader: true, references: true }
  })

  const categoryName = category.replace('_', ' ')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-indigo-900 mb-2">Danh mục: {categoryName}</h1>
        <p className="text-indigo-700">Tổng số báo cáo: <span className="font-bold">{reports.length}</span></p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Chưa có báo cáo nào trong danh mục này.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map(report => (
              <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <a href={report.url} target="_blank" rel="noopener noreferrer" className="font-bold text-xl text-indigo-600 hover:underline flex items-center gap-2">
                      {report.title}
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {format(report.createdAt, 'dd/MM/yyyy HH:mm')}</span>
                      <span>Người tải lên: <span className="font-medium text-slate-700">{report.uploader.username}</span></span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider">{report.format}</span>
                </div>

                {report.references.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-500" /> Nguồn tham khảo:
                    </h4>
                    <ul className="space-y-1.5">
                      {report.references.map(ref => (
                        <li key={ref.id} className="text-sm">
                          <a href={ref.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
                            {ref.sourceUrl}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
