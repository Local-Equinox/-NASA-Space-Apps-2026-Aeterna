import { useState } from 'react'

const BASE = './assets/intro/'

interface Props {
  /** File name in public/assets/intro/, e.g. "hero-astronaut.png". Swap the image by replacing that file. */
  file: string
  /** Leave empty for purely decorative cut-outs: they are then hidden from screen readers. */
  alt?: string
  className?: string
  /** Load straight away (hero only). Everything else is lazy-loaded. */
  eager?: boolean
}

/**
 * An intro image. It tries a .webp with the same name first, then the file itself, and if neither exists
 * it shows a labelled placeholder box, so the layout works before the real images arrive.
 */
export default function IntroImage({ file, alt = '', className = '', eager = false }: Props) {
  const webp = file.replace(/\.(png|jpe?g)$/i, '.webp')
  const [step, setStep] = useState(0) // 0 = .webp, 1 = original, 2 = placeholder
  const decorative = alt === ''
  if (step === 2) {
    return (
      <span className={`intro-ph ${className}`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : alt} aria-hidden={decorative || undefined}>
        <span>{file}</span>
      </span>
    )
  }
  return (
    <img
      className={className}
      src={BASE + (step === 0 ? webp : file)}
      alt={alt}
      aria-hidden={decorative || undefined}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => setStep(step + 1)}
    />
  )
}
