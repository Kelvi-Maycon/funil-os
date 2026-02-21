import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Folder,
  Network,
  CheckSquare,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  Bookmark,
  Settings,
  Zap,
  LayoutGrid,
  ChevronsLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import QuickActionModal from '@/components/QuickActionModal'

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
  { title: 'Projetos', icon: Folder, url: '/projetos' },
  { title: 'Canvas', icon: Network, url: '/canvas' },
  { title: 'Tarefas', icon: CheckSquare, url: '/tarefas' },
  { title: 'Documentos', icon: FileText, url: '/documentos' },
  { title: 'Assets', icon: ImageIcon, url: '/assets' },
  { title: 'Insights', icon: Lightbulb, url: '/insights' },
  { title: 'Swipe File', icon: Bookmark, url: '/swipe-file' },
]

export default function Layout() {
  const location = useLocation()
  return (
    <SidebarProvider>
      <Sidebar className="border-r-0 shadow-[1px_0_20px_rgba(0,0,0,0.03)] bg-white z-30">
        <SidebarHeader className="h-24 flex flex-row items-center px-6 pt-6 bg-white">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md transition-transform hover:scale-105">
              <Zap size={20} className="fill-white" />
            </div>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 shrink-0 border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <LayoutGrid size={18} />
            </div>
            <div className="flex-1" />
            <SidebarTrigger className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 bg-transparent shrink-0">
              <ChevronsLeft size={18} />
            </SidebarTrigger>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 pt-6 bg-white">
          <SidebarGroup>
            <div className="mb-4 px-2 text-[11px] font-bold text-slate-900 tracking-wider">
              Logic
            </div>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'rounded-2xl h-11 px-3.5 transition-all duration-200',
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-medium shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon
                          size={18}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={cn(
                            isActive ? 'text-slate-900' : 'text-slate-400',
                          )}
                        />
                        <span className="text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-5 bg-white pb-6">
          <div className="bg-slate-50 border border-slate-100/80 rounded-[1.5rem] p-3 flex flex-row items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-800 font-bold text-sm shadow-sm border border-slate-100">
              DK
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-slate-700 truncate">
                info@mail.com
              </span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-slate-700 transition-colors">
              <Settings size={14} />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[#f8fafc] relative flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex items-center px-4 border-b bg-white md:hidden shrink-0 z-10 shadow-sm">
          <SidebarTrigger />
          <span className="ml-4 font-bold text-lg text-slate-900">
            Funil OS
          </span>
        </header>
        <main className="flex-1 overflow-auto animate-fade-in relative pt-4 md:pt-0">
          <Outlet />
        </main>
      </SidebarInset>
      <QuickActionModal />
    </SidebarProvider>
  )
}
