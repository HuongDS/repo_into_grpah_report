import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const postId = parseInt(id)
  if (isNaN(postId)) notFound()

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author:   { select: { id: true, username: true } },
      comments: {
        include: { author: { select: { id: true, username: true } } },
        orderBy:  { createdAt: 'asc' }
      }
    }
  })
  if (!post) notFound()

  const currentUserId = parseInt((session.user as any).id)
  const currentRole   = (session.user as any).role

  return (
    <BlogPostClient
      post={post as any}
      currentUserId={currentUserId}
      currentRole={currentRole}
      currentUsername={(session.user?.name) || ''}
    />
  )
}
