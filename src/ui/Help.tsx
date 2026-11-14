import { useGame } from '../state/game'

export default function Help() {
  const { setOverlay } = useGame()
  return (
    <section className="overlay" role="dialog" aria-labelledby="help-title">
      <h2 id="help-title">Controls</h2>
      <ul>
        <li><b>W A S D</b>: fly forward, left, back, right</li>
        <li><b>Space / C</b>: up / down</li>
        <li><b>Shift</b>: boost</li>
        <li><b>Drag</b>: look around</li>
        <li><b>After take-off</b> you circle Earth. Click the Moon or Mars (or use Bodies), then Warp. Any flight key takes the controls.</li>
        <li><b>On foot:</b> WASD walk, Shift run, Space jump, E board your ship when you are next to it</li>
        <li><b>L</b>: land when close to a world</li>
        <li><b>H</b>: show this help</li>
      </ul>
      <button className="button" onClick={() => setOverlay('none')}>Got it</button>
    </section>
  )
}
