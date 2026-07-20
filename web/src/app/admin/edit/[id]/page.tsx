import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import EditReportClient from './EditReportClient'

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const reportId = parseInt(id)
  if (isNaN(reportId)) notFound()

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { references: true, uploader: true }
  })
  if (!report) notFound()

  const userId = parseInt((session.user as any).id)
  const role   = (session.user as any).role

  if (report.uploaderId !== userId) {
    redirect('/')
  }

  return <EditReportClient report={report as any} />
}
