'use client'

import { useState } from 'react'
import { submitReport } from '@/app/actions'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, UploadCloud, FileUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [references, setReferences] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!session) return null 

  const handleAddRef = () => setReferences([...references, ''])
  const handleRemoveRef = (idx: number) => setReferences(references.filter((_, i) => i !== idx))
  const handleRefChange = (idx: number, val: string) => {
    const newRefs = [...references]
    newRefs[idx] = val
    setReferences(newRefs)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      const formData = new FormData(e.currentTarget)
      const res = await submitReport(formData)
      
      if (res?.error) {
        setErrorMsg(res.error)
      } else if (res?.success) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setErrorMsg('Lỗi mạng hoặc server không phản hồi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pt-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <UploadCloud className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Thêm Báo cáo Mới</h1>
              <p className="text-blue-100 mt-2 text-sm md:text-base">Hệ thống sẽ tự động trích xuất định dạng và đồng bộ lên đám mây Supabase</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 font-medium text-sm"
            >
              Cảnh báo: {errorMsg}
            </motion.div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề báo cáo</label>
              <input required type="text" name="title" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="VD: Báo cáo kết quả nghiên cứu tuần 1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">File đính kèm</label>
                <div className="relative w-full">
                  <input required type="file" name="file" className="w-full px-3 py-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" accept=".pdf,.docx,.md,.html" />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileUp className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Thuộc danh mục</label>
                <select required name="category" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer">
                  <option value="Question_Evaluate">Question Evaluate</option>
                  <option value="Question_Generate">Question Generate</option>
                  <option value="Solution_Report">Solution Report</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-4">Các nguồn tài liệu tham khảo (Tùy chọn)</label>
            <div className="space-y-4">
              {references.map((ref, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className="flex gap-3"
                >
                  <input 
                    type="url" 
                    name="references"
                    value={ref}
                    onChange={(e) => handleRefChange(idx, e.target.value)}
                    className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                    placeholder="https://doaj.org/..." 
                  />
                  {references.length > 1 && (
                    <button type="button" onClick={() => handleRemoveRef(idx)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 bg-slate-50 hover:border-red-100 border border-slate-200 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            <button type="button" onClick={handleAddRef} className="mt-4 px-4 py-2 text-sm flex items-center gap-2 text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Thêm đường link
            </button>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">Nhật ký cập nhật hệ thống (Changelog)</label>
            <p className="text-sm text-slate-500 mb-4">Mô tả ngắn gọn bạn đã thay đổi gì trong lần tải lên này. Sẽ được ghim ra ngoài trang chủ.</p>
            <textarea name="updateNote" rows={3} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none" placeholder="VD: Thêm 5 câu hỏi mới vào danh mục Evaluate..."></textarea>
          </div>

          <div className="pt-4">
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading} 
              type="submit" 
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý tải lên...
                </>
              ) : 'Xác nhận Lưu Báo cáo'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
