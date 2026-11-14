import { useGame } from '../state/game'

export default function Help() {
  const { setOverlay } = useGame()
  return (
    <section className="overlay" role="dialog" aria-labelledby="help-title">
      <h2 id="help-title">Controls</h2>
      <ul className="touch-help touch-only-block">
        <li><b>Left stick</b>: walk or fly (push it to the edge to run or move faster)</li>
        <li><b>Jump</b> on foot. In space, <b>Up</b> / <b>Down</b> climb and dive, <b>Boost</b> goes faster</li>
        <li><b>Drag on the view</b>: look around. <b>Pinch</b> on foot to zoom the camera</li>
        <li><b>Tap</b> the glowing button at the bottom to inspect, board your ship, land or spacewalk</li>
        <li><b>Tap</b> a planet or moon to select it. <b>Map</b> and <b>Missions</b> are at the top; ⚙ has fullscreen and sound</li>
      </ul>
      <ul className="kb-only-block">
        <li><b>W A S D</b>: fly forward, left, back, right</li>
        <li><b>Space / C</b>: up / down</li>
        <li><b>Shift</b>: boost</li>
        <li><b>Hold right-click and drag</b> (or drag with a finger): look around</li>
        <li><b>After take-off</b> you circle Earth. Click the Moon or Mars (or pick one from Missions), then Warp. Any flight key takes the controls.</li>
        <li><b>On foot:</b> WASD walk, Shift run, Space jump, E board your ship when you are next to it</li>
        <li><b>M</b>: open the world map (or tap the mini-map)</li>
        <li><b>E</b>: inspect equipment, then clear the debris and brush off the dust to read its nameplate</li>
        <li><b>L</b>: land when close to a world</li>
        <li><b>H</b>: show this help</li>
      </ul>
      <button className="button" onClick={() => setOverlay('none')}>Got it</button>
    </section>
  )
}
