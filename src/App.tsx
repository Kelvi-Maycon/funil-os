import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Funnels from './pages/Funnels'
import Canvas from './pages/Canvas'
import Tasks from './pages/Tasks'
import Documents from './pages/Documents'
import Assets from './pages/Assets'
import Insights from './pages/Insights'
import SwipeFile from './pages/SwipeFile'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/projetos" element={<Projects />} />
          <Route path="/projetos/:id" element={<ProjectDetail />} />
          <Route path="/canvas" element={<Funnels />} />
          <Route path="/canvas/:id" element={<Canvas />} />
          <Route path="/tarefas" element={<Tasks />} />
          <Route path="/documentos" element={<Documents />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/swipe-file" element={<SwipeFile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
