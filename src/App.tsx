import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalSearch } from '@/components/GlobalSearch'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { ThemeProvider } from '@/components/ThemeProvider'
import Layout from './components/Layout'

const Index = lazy(() => import('./pages/Index'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Funnels = lazy(() => import('./pages/Funnels'))
const Canvas = lazy(() => import('./pages/Canvas'))
const Tasks = lazy(() => import('./pages/Tasks'))
const Documents = lazy(() => import('./pages/Documents'))
const Library = lazy(() => import('./pages/Library'))

const App = () => (
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalSearch />
        <GlobalErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center h-screen w-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/projetos" element={<Projects />} />
                <Route path="/projetos/:id" element={<ProjectDetail />} />
                <Route path="/canvas" element={<Funnels />} />
                <Route path="/canvas/:id" element={<Canvas />} />
                <Route path="/tarefas" element={<Tasks />} />
                <Route path="/documentos" element={<Documents />} />
                <Route path="/biblioteca" element={<Library />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </GlobalErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
