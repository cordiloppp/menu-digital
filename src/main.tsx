import { createRoot } from 'react-dom/client'
import 'virtual:fuentes' // solo la tipografía elegida en restaurant.json
import './index.css'
import App from './App'
import { CarritoProvider } from './hooks/useCart'

createRoot(document.getElementById('root')!).render(
  <CarritoProvider>
    <App />
  </CarritoProvider>,
)
