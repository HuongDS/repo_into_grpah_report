import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PlusCircle, MessageSquare, Clock, User } from 'lucide-react'

export default async function BlogPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const posts = await prisma.post.findMany({
    include: {
      author: { select: { username: true } },
      _count:  { select: { comments: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="w-[95%] lg:w-[90%] max-w-5xl mx-auto pt-4 pb-24 space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 to-navy-700" />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-navy-300 text-xs font-semibold uppercase tracking-widest mb-2">Nhóm nghiên cứu</p>
            <h1 className="text-3xl font-extrabold text-white mb-2">Blog & Thảo luận</h1>
            <p className="text-navy-200/80 text-sm">Chia sẻ vấn đề, giải pháp và kiến thức với các thành viên trong nhóm.</p>
          </div>
          <Link href="/blog/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-800 font-bold rounded-2xl hover:bg-navy-50 transition-all shadow-md shrink-0">
            <PlusCircle className="w-5 h-5 text-navy-600" />
            Đăng bài mới
          </Link>
        </div>
      </div>

      {/* Post list */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-bold text-slate-600 mb-2">Chưa có bài viết nào</h3>
          <p className="text-slate-400 text-sm mb-5">Hãy là người đầu tiên đăng bài thảo luận trong nhóm!</p>
          <Link href="/blog/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-700 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-all">
            <PlusCircle className="w-4 h-4" /> Đăng bài ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.id}`}
              className="group block bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-navy-100 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg text-slate-800 group-hover:text-navy-700 transition-colors line-clamp-2 mb-3">
                    {post.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-[9px] font-bold uppercase">
                        {post.author.username.charAt(0)}
                      </div>
                      {post.author.username}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(post.createdAt), 'dd MMM yyyy, HH:mm', { locale: vi })}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 text-sm text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-semibold text-slate-600">{post._count.comments}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
