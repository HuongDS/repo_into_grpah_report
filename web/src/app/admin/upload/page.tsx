'use client'

import { useState } from 'react'
import { submitReport } from '@/app/actions'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, UploadCloud, FileUp, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      // Append references multiple times so it's a list
      formData.delete('references')
      references.forEach(ref => {
        if (ref.trim()) formData.append('references', ref.trim())
      })

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
    <div className="max-w-3xl mx-auto pt-4 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 mb-4 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Quay lại Dashboard
        </Link>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 p-8 text-white shadow-sm">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
              <UploadCloud className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-navy-300 text-xs font-semibold uppercase tracking-widest mb-1">Upload mới</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">Thêm Báo cáo</h1>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
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
              <input required type="text" name="title" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition-all" placeholder="VD: Báo cáo kết quả nghiên cứu tuần 1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">File đính kèm</label>
                <div className="relative w-full">
                  <input required type="file" name="file" className="w-full px-3 py-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition-all file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer" accept=".pdf,.docx,.md,.html" />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileUp className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Thuộc danh mục</label>
                <select required name="category" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition-all cursor-pointer">
                  <option value="Question_Evaluate">Question Evaluate</option>
                  <option value="Question_Generate">Question Generate</option>
                  <option value="Analyze_Source">Analyze Source</option>
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
                    value={ref}
                    onChange={(e) => handleRefChange(idx, e.target.value)}
                    className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition-all" 
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
            <button type="button" onClick={handleAddRef} className="mt-4 px-4 py-2 text-sm flex items-center gap-2 text-navy-600 font-bold bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Thêm đường link
            </button>
          </div>

          <div className="pt-4">
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading} 
              type="submit" 
              className="w-full py-4 bg-navy-700 text-white rounded-xl font-bold text-lg hover:bg-navy-800 shadow-md shadow-navy-900/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
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
