import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OverviewClient from './OverviewClient'
import { redirect } from 'next/navigation'

export default async function OverviewPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const currentUserId = parseInt((session.user as any).id)
  const currentUserRole = (session.user as any).role

  const pinnedReports = await prisma.pinnedReport.findMany({
    include: {
      report: {
        include: { uploader: true, references: true }
      }
    }
  })

  const allReports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: { uploader: true }
  })

  return (
    <OverviewClient 
      pinnedReports={pinnedReports} 
      allReports={allReports} 
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
    />
  )
}
