export default function SceneFallback() {
  return (
    <div className="scene-fallback">
      <div className="scene-fallback__halo scene-fallback__halo--primary" />
      <div className="scene-fallback__halo scene-fallback__halo--secondary" />

      <div className="scene-fallback__rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="scene-fallback__vial" aria-hidden="true">
        <div className="scene-fallback__cap" />
        <div className="scene-fallback__glass">
          <div className="scene-fallback__liquid" />
          <div className="scene-fallback__label" />
          <div className="scene-fallback__highlight" />
        </div>
      </div>
    </div>
  )
}
