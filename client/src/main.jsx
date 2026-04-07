import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'

import QRLanding from './views/QRLanding.jsx'
import Catalog from './views/Catalog.jsx'
import Player from './views/Player.jsx'
import Presenter from './views/Presenter.jsx'

import './styles/variables.css'
import './styles/reset.css'
import './styles/layout.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QRLanding />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/player/:id" element={<Player />} />
        <Route path="/presenter" element={<Presenter />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
