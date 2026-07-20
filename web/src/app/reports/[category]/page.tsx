import { prisma } from '@/lib/prisma'
import CategoryClient from './CategoryClient'

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const category = resolvedParams.category;

  const reports = await prisma.report.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
    include: { uploader: true, references: true }
  })

  const categoryName = category.replace('_', ' ')

  return <CategoryClient categoryName={categoryName} reports={reports} />
}
