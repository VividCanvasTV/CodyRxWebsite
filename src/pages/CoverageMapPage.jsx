import { useEffect } from 'react'
import StateLicenseMap3D from '../components/StateLicenseMap3D'

export default function CoverageMapPage() {
  const params = new URLSearchParams(window.location.search)
  const embedded = params.has('embedded')

  useEffect(() => {
    if (!embedded) return undefined

    document.body.classList.add('license-map-embed-route')

    return () => {
      document.body.classList.remove('license-map-embed-route')
    }
  }, [embedded])

  if (embedded) {
    return (
      <div className="coverage-map-embed-page">
        <StateLicenseMap3D embedded />
      </div>
    )
  }

  return <StateLicenseMap3D />
}
