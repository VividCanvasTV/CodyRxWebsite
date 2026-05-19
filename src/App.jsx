import { lazy, Suspense } from 'react'
import BrighterHome from './components/BrighterHome'
import './App.css'

const CompoundingPage = lazy(() => import('./pages/CompoundingPage'))
const CoverageMapPage = lazy(() => import('./pages/CoverageMapPage'))

function App() {
  if (window.location.pathname.startsWith('/coverage-map')) {
    return (
      <Suspense fallback={null}>
        <CoverageMapPage />
      </Suspense>
    )
  }

  if (window.location.pathname.startsWith('/services/compounding')) {
    return (
      <Suspense fallback={null}>
        <CompoundingPage />
      </Suspense>
    )
  }

  return <BrighterHome />
}

export default App
