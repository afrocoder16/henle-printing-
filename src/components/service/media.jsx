import { useState } from 'react'
import { Camera, Play } from 'lucide-react'

const base = import.meta.env.BASE_URL

// Shows public/services/<file> when it exists, then the slot's stand-in photo, then a labeled placeholder.
export function Photo({ slot, className = '', eager = false, showCaption = true }) {
  const sources = [`${base}services/${slot.file}`, slot.fallback].filter(Boolean)
  const [index, setIndex] = useState(0)
  const src = sources[index]

  return (
    <figure className={`sp-photo ${className}`}>
      {src ? (
        <img
          src={src}
          alt={slot.caption}
          loading={eager ? 'eager' : 'lazy'}
          onError={() => setIndex((i) => i + 1)}
        />
      ) : (
        <div className="sp-photo__missing" role="img" aria-label={`Photo placeholder: ${slot.need}`}>
          <Camera aria-hidden="true" />
          <b>Photo needed</b>
          <span>{slot.need}</span>
          <code>public/services/{slot.file}</code>
        </div>
      )}
      {showCaption && <figcaption>{slot.caption}</figcaption>}
    </figure>
  )
}

// A click-to-play YouTube embed. No third-party requests happen until someone presses play.
export function VideoSlot({ video, tone }) {
  const [playing, setPlaying] = useState(false)

  if (!video.youtubeId) {
    return (
      <div className={`sp-video sp-video--empty sp-video--${tone}`}>
        <span className="sp-video__play" aria-hidden="true"><Play fill="currentColor" /></span>
        <strong>{video.title}</strong>
        <small>Video goes here — add the YouTube ID in serviceData.js</small>
      </div>
    )
  }

  return (
    <div className={`sp-video sp-video--${tone} ${playing ? 'is-playing' : ''}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${video.title}`}>
          <span className="sp-video__play"><Play fill="currentColor" /></span>
          <strong>{video.title}</strong>
          <small>Watch · opens YouTube player</small>
        </button>
      )}
    </div>
  )
}
