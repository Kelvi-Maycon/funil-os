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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
      <Sidebar
        collapsible="none"
        className="border-r border-border bg-card z-30 flex flex-col w-[56px] shadow-sm shrink-0"
      >
        <SidebarHeader className="h-16 flex items-center justify-center p-0 shrink-0">
          <div className="w-[40px] h-[40px] bg-primary rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm transition-transform hover:scale-105 cursor-pointer">
            <Zap size={20} className="fill-white" />
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2 flex-1 items-center flex flex-col gap-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          <SidebarMenu className="gap-2 w-full flex flex-col items-center">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.url ||
                (item.url !== '/' && location.pathname.startsWith(item.url))
              return (
                <SidebarMenuItem
                  key={item.url}
                  className="w-full flex justify-center"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          'w-[40px] h-[40px] p-0 flex items-center justify-center rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-accent text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <Link to={item.url}>
                          <item.icon
                            size={20}
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="ml-2 bg-secondary text-secondary-foreground text-sm border-none shadow-md"
                    >
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2 pb-4 flex flex-col items-center shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-[40px] h-[40px] rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold text-sm cursor-pointer hover:bg-border transition-colors border border-border">
                DK
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="ml-2 bg-secondary text-secondary-foreground text-sm border-none shadow-md"
            >
              Configurações e Perfil
            </TooltipContent>
          </Tooltip>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background relative flex flex-col h-screen overflow-hidden w-full">
        <header className="h-16 flex items-center px-4 border-b bg-card md:hidden shrink-0 z-10 shadow-sm">
          <span className="font-bold text-xl text-foreground">Funil OS</span>
        </header>
        <main className="flex-1 overflow-auto animate-fade-in relative">
          <Outlet />
        </main>
      </SidebarInset>
      <QuickActionModal />
    </SidebarProvider>
  )
}
