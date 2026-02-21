import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
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
  Zap,
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

function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-card z-30 shadow-sm"
    >
      <SidebarHeader className="h-16 flex flex-row items-center justify-between px-3 shrink-0 relative">
        <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
            <Zap size={18} className="fill-white" />
          </div>
          <span className="font-bold text-lg text-foreground truncate">
            Funil OS
          </span>
        </div>
        <div className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 flex flex-col gap-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.url ||
                (item.url !== '/' && location.pathname.startsWith(item.url))
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      'transition-all duration-200 h-10 rounded-lg',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary'
                        : 'text-muted-foreground font-medium hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold text-sm cursor-pointer hover:bg-border transition-colors border border-border shrink-0">
            DK
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-foreground truncate">
              Diego K.
            </span>
            <span className="text-xs text-muted-foreground truncate">
              diego@funilos.com
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function Layout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-background relative flex flex-col h-screen overflow-hidden w-full">
        <header className="h-16 flex items-center justify-between px-4 border-b bg-card md:hidden shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
              <Zap size={18} className="fill-white" />
            </div>
            <span className="font-bold text-lg text-foreground">Funil OS</span>
          </div>
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto animate-fade-in relative flex flex-col">
          <Outlet />
        </main>
      </SidebarInset>
      <QuickActionModal />
    </SidebarProvider>
  )
}
