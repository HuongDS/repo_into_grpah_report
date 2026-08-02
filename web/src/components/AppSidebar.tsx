'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, UploadCloud,
  Code2, MessageSquare, Library,
  LayoutTemplate, CheckCircle, Sparkles, PieChart, Lightbulb, FolderLock,
  ChevronDown, ChevronRight
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { clsx } from 'clsx'
import { useState } from 'react'

const navLinks = [
  { href: '/',                         label: 'Trang chủ',          icon: LayoutDashboard },
  { 
    href: '/overview', 
    label: 'Tổng quan', 
    icon: LayoutTemplate,
    subItems: [
      { href: '/reports/Question_Evaluate', label: 'Đánh giá câu hỏi',   icon: CheckCircle },
      { href: '/reports/Question_Generate', label: 'Tạo câu hỏi',        icon: Sparkles },
      { href: '/reports/Analyze_Source',    label: 'Phân tích nguồn',    icon: PieChart },
      { href: '/reports/Solution_Report',   label: 'Báo cáo giải pháp',  icon: Lightbulb },
    ]
  },
  { href: '/documents',                label: 'Tài liệu nội bộ',    icon: FolderLock },
  { href: '/references',               label: 'Tài liệu tham khảo', icon: Library },
  { href: '/blog',                     label: 'Blog thảo luận',     icon: MessageSquare },
  { href: '/admin/upload',             label: 'Tải lên báo cáo',    icon: UploadCloud },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [overviewOpen, setOverviewOpen] = useState(true)

  if (!session) return null

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarHeader className="pt-4 pb-2 px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-navy-400 to-blue-500 rounded-lg flex items-center justify-center shadow-md shrink-0">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight text-sm truncate group-data-[collapsible=icon]:hidden">
            RepoIntoGraph
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 mt-4 custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 mb-2 group-data-[collapsible=icon]:hidden">Menu chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                
                if (link.subItems) {
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton 
                        render={<Link href={link.href} />}
                        isActive={isActive}
                        tooltip={link.label}
                        className={clsx(
                          "rounded-xl transition-colors font-medium flex items-center justify-between gap-3 w-full",
                          isActive 
                            ? "bg-navy-50 text-navy-700 font-bold shadow-sm border border-navy-100/50" 
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <link.icon className="w-4 h-4" />
                          <span>{link.label}</span>
                        </div>
                        <div 
                          className="p-1 -mr-2 rounded-md hover:bg-slate-200/50 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            setOverviewOpen(!overviewOpen);
                          }}
                        >
                          {overviewOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </SidebarMenuButton>

                      {overviewOpen && (
                        <SidebarMenuSub>
                          {link.subItems.map((sub) => {
                            const isSubActive = pathname === sub.href
                            return (
                              <SidebarMenuSubItem key={sub.href}>
                                <SidebarMenuSubButton 
                                  render={<Link href={sub.href} />}
                                  isActive={isSubActive}
                                  className={clsx(
                                    "rounded-lg transition-colors font-medium flex items-center gap-2",
                                    isSubActive 
                                      ? "bg-navy-50 text-navy-700 font-bold" 
                                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <sub.icon className="w-3.5 h-3.5 shrink-0" />
                                  <span className="text-sm truncate">{sub.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                }

                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton 
                      render={<Link href={link.href} />}
                      isActive={isActive}
                      tooltip={link.label}
                      className={clsx(
                        "rounded-xl transition-colors font-medium flex items-center gap-3",
                        isActive 
                          ? "bg-navy-50 text-navy-700 font-bold shadow-sm border border-navy-100/50" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200">
        <div className="flex flex-col gap-2 text-xs text-slate-500 font-medium group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-800">RepoIntoGraph</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/HuongDS/Repo_Into_Graph" target="_blank" rel="noopener noreferrer" className="hover:text-navy-600 transition-colors">GitHub</a>
            <span>•</span>
            <a href="#" className="hover:text-navy-600 transition-colors">Docs</a>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
