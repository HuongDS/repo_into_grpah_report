import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ReferencesClient from './ReferencesClient'

export default async function ReferencesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const role = (session.user as any).role

  // Group references by report
  const reports = await prisma.report.findMany({
    where: { references: { some: {} } },
    include: {
      references: { orderBy: { id: 'asc' } },
      uploader: { select: { username: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Stats
  const totalRefs = await prisma.reference.count()
  const totalReports = await prisma.report.count()

  return (
    <ReferencesClient
      reports={reports as any}
      totalRefs={totalRefs}
      totalReports={totalReports}
      isAdmin={role === 'ADMIN'}
    />
  )
}
