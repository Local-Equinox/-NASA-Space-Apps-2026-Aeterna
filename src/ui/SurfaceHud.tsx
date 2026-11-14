import { useGame } from '../state/game'

export default function SurfaceHud() {
  const { scene, surfaceWorld, overlay, board } = useGame()
  if (scene !== 'surface' || overlay === 'story') return null
  return (
    <>
      {overlay === 'none' && surfaceWorld !== 'earth' && (
        <div className="return-button">
          <button className="btn-glow soft" onClick={board}>Return to ship</button>
        </div>
      )}
      <p className="small controls-hint">WASD walk · Shift run · Space jump · right-drag to look · wheel to zoom · E inspect / board</p>
    </>
  )
}
