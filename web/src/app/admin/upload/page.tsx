'use client'

import { useState } from 'react'
import { submitReport } from '@/app/actions'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

export default function UploadPage() {
  const { data: session, status } = useSession()
  const [references, setReferences] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)

  if (status === 'loading') return <div className="p-8 text-center">Đang tải...</div>
  if (!session) {
    redirect('/api/auth/signin')
  }

  const handleAddRef = () => setReferences([...references, ''])
  const handleRemoveRef = (idx: number) => setReferences(references.filter((_, i) => i !== idx))
  const handleRefChange = (idx: number, val: string) => {
    const newRefs = [...references]
    newRefs[idx] = val
    setReferences(newRefs)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Thêm Báo cáo Mới</h1>
      
      <form action={async (formData) => {
        setLoading(true)
        try {
          await submitReport(formData)
        } catch (error) {
          console.error(error)
          alert('Có lỗi xảy ra khi thêm báo cáo!')
          setLoading(false)
        }
      }} className="space-y-6">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề báo cáo</label>
            <input required type="text" name="title" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: Báo cáo tiến độ tuần 1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">File Báo Cáo (Sẽ tự động upload lên Google Drive)</label>
            <input required type="file" name="file" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" accept=".pdf,.docx,.md,.html" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Định dạng</label>
              <select required name="format" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value=".pdf">.pdf</option>
                <option value=".docx">.docx</option>
                <option value=".md">.md</option>
                <option value=".html">.html</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
              <select required name="category" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Question_Evaluate">Question Evaluate</option>
                <option value="Question_Generate">Question Generate</option>
                <option value="Solution_Report">Solution Report</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-slate-700 mb-2">Nguồn bài báo khoa học tham khảo</label>
          <div className="space-y-3">
            {references.map((ref, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  type="url" 
                  name="references"
                  value={ref}
                  onChange={(e) => handleRefChange(idx, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Link URL bài báo..." 
                />
                {references.length > 1 && (
                  <button type="button" onClick={() => handleRemoveRef(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddRef} className="mt-3 text-sm flex items-center gap-1 text-indigo-600 font-medium hover:underline">
            <Plus className="w-4 h-4" /> Thêm nguồn tham khảo
          </button>
        </div>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-slate-700 mb-1">Cập nhật hệ thống (Tùy chọn)</label>
          <p className="text-xs text-slate-500 mb-2">Ghi chú những thay đổi mới nhất (nếu có). Ghi chú này sẽ hiện ở trang chủ.</p>
          <textarea name="updateNote" rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Mô tả cập nhật..."></textarea>
        </div>

        <button disabled={loading} type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {loading ? 'Đang xử lý...' : 'Lưu Báo Cáo'}
        </button>
      </form>
    </div>
  )
}
