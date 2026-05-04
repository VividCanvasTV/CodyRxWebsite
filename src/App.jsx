import BrighterHome from './components/BrighterHome'
import CompoundingPage from './pages/CompoundingPage'
import './App.css'

function App() {
  if (window.location.pathname.startsWith('/services/compounding')) {
    return <CompoundingPage />
  }

  return <BrighterHome />
}

export default App
