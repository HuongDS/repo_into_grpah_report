'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { uploadFileToDrive } from '@/lib/drive'

export async function submitReport(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const file = formData.get('file') as File | null
  const format = formData.get('format') as string
  const category = formData.get('category') as string
  const updateNote = formData.get('updateNote') as string
  const references = formData.getAll('references') as string[]

  if (!title || !file || !format || !category) {
    throw new Error('Missing required fields')
  }

  let fileUrl = ''
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!folderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID is missing in .env')
    }
    fileUrl = await uploadFileToDrive(file, folderId) || ''
  } catch (error: any) {
    throw new Error(error.message)
  }

  // Create the report
  const report = await prisma.report.create({
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

  // Create update log if provided
  if (updateNote && updateNote.trim() !== '') {
    await prisma.updateLog.create({
      data: {
        description: updateNote
      }
    })
  }

  revalidatePath('/')
  revalidatePath(`/reports/${category}`)
  redirect('/')
}
