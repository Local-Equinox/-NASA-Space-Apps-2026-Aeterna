import { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/game'

// Flashback video between the minigame and the story. The files are placeholders the team fills in later
// (see public/assets/cutscenes/README.md). If a file is missing, players go straight to the story.
export default function Cutscene() {
  const { site, setOverlay } = useGame()
  const video = useRef<HTMLVideoElement>(null)
  const [missing, setMissing] = useState(false)
  const [playError, setPlayError] = useState(false)
  const [playing, setPlaying] = useState(false)
  const next = () => setOverlay('story')
  const src = site?.cutscene

  useEffect(() => {
    if (!site) return
    if (!src) { setOverlay('story'); return }
  }, [site, src, setOverlay])

  // Start playback directly from a player click so browsers grant audio playback.
  const playWithSound = () => {
    const v = video.current
    if (!v) return
    v.defaultMuted = false
    v.muted = false
    v.volume = 1
    setPlayError(false)
    v.play().catch(() => setPlayError(true))
  }

  // A missing file: skip for players, but show the team where the video goes while developing.
  const onError = () => { if (import.meta.env.DEV) setMissing(true); else next() }

  if (!site || !src) return null
  return (
    <section className="overlay cutscene" role="dialog" aria-labelledby="cutscene-title">
      <h2 id="cutscene-title">Flashback: {site.name}</h2>
      <button className="button cutscene-skip" onClick={next}>Skip flashback</button>
      {missing ? (
        <div className="cutscene-placeholder">
          <p><b>Flashback video placeholder</b></p>
          <p className="small">Add the video file here and it will play at this point:</p>
          <p><code>public/{src}</code></p>
          <p className="small">Players never see this card: without the file, the game goes straight to the story.</p>
        </div>
      ) : (
        <div className="cutscene-player">
          <video ref={video} src={`./${src}`} controls playsInline onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={next} onError={onError} />
          {!playing && <button className="button cutscene-play" onClick={playWithSound}>Play with sound</button>}
          {playError && <p className="small cutscene-play-error" role="alert">Couldn’t start playback. Use the video’s play control to try again.</p>}
        </div>
      )}
    </section>
  )
}
