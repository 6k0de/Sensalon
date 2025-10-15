import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRoutes } from './routes/routes.tsx'
import { HeroUIProvider } from '@heroui/react'

createRoot(document.getElementById('root')!).render(
  <HeroUIProvider>
    <AppRoutes />
  </HeroUIProvider>
  ,
)
