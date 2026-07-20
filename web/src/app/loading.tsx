import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4">
      <div className="w-16 h-16 relative flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        <Loader2 className="w-6 h-6 text-blue-500 animate-pulse absolute" />
      </div>
      <p className="text-sm font-bold text-slate-500 animate-pulse tracking-widest uppercase">Đang tải dữ liệu...</p>
    </div>
  )
}
