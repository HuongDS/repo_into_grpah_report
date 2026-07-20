'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { uploadFileToDrive } from '@/lib/drive'

export async function submitReport(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { error: 'Vui lòng đăng nhập lại (Unauthorized)' }
    }

    const title = formData.get('title') as string
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string
    const updateNote = formData.get('updateNote') as string
    const references = formData.getAll('references') as string[]

    if (!title || !file || !category || file.size === 0) {
      return { error: 'Vui lòng điền đầy đủ thông tin và chọn file hợp lệ' }
    }

    // Tự động nhận diện định dạng file
    const fileName = file.name
    const format = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '.unknown'

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!folderId || folderId === 'YOUR_FOLDER_ID_HERE') {
      return { error: 'Chưa cấu hình GOOGLE_DRIVE_FOLDER_ID trong biến môi trường' }
    }

    // Upload lên Google Drive
    const fileUrl = await uploadFileToDrive(file, folderId)
    if (!fileUrl) {
      return { error: 'Không thể lấy được đường dẫn file từ Google Drive' }
    }

    // Lưu vào Database
    await prisma.report.create({
      data: {
        title,
        url: fileUrl,
        format,
        category,
        uploaderId: parseInt((session.user as any).id),
        references: {
          create: references.filter(r => r.trim() !== '').map(r => ({
            sourceUrl: r
          }))
        }
      }
    })

    if (updateNote && updateNote.trim() !== '') {
      await prisma.updateLog.create({
        data: {
          description: updateNote
        }
      })
    }

    revalidatePath('/')
    revalidatePath(`/reports/${category}`)
    
    return { success: true }
  } catch (error: any) {
    console.error("Lỗi khi upload server action:", error)
    return { error: error.message || 'Lỗi hệ thống không xác định. Vui lòng kiểm tra lại cấu hình credentials.json.' }
  }
}
