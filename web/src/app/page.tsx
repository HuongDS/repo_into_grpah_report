import { prisma } from '@/lib/prisma'
import DashboardClient from './DashboardClient'

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const selectedDateStr = resolvedSearchParams.date;
  
  const dateFilter = selectedDateStr ? {
    createdAt: {
      gte: new Date(`${selectedDateStr}T00:00:00.000Z`),
      lt: new Date(`${selectedDateStr}T23:59:59.999Z`)
    }
  } : {}

  const reports = await prisma.report.findMany({
    where: dateFilter,
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { uploader: true }
  })

  const updateLogs = await prisma.updateLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return <DashboardClient selectedDateStr={selectedDateStr} reports={reports} updateLogs={updateLogs} />
}
