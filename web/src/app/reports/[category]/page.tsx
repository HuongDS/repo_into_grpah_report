import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import CategoryClient from './CategoryClient'

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params
  const category = resolvedParams.category
  const session  = await getServerSession(authOptions)

  const reports = await prisma.report.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
    include: { uploader: true, references: true }
  })

  const categoryName    = category.replace(/_/g, ' ')
  const currentUserId   = session ? parseInt((session.user as any).id) : null
  const currentUserRole = (session?.user as any)?.role || 'USER'

  return (
    <CategoryClient
      categoryName={categoryName}
      reports={reports as any}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
    />
  )
}
