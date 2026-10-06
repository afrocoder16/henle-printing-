import { useEffect, useRef, useState } from 'react'

export default function CountUp({ end, start = 0, prefix = '', suffix = '', decimals = 0, duration = 1400, label, group = false }) {
  const [value, setValue] = useState(start)
  const elementRef = useRef(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setValue(end)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return
        hasRun.current = true
        const startedAt = performance.now()

        const tick = (now) => {
          const progress = Math.min((now - startedAt) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(start + (end - start) * eased)
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.45 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [end, start, duration])

  const display = group ? Number(value).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : Number(value).toFixed(decimals)

  return (
    <strong ref={elementRef} className="count-up">
      <span className="sr-only">{label || `${prefix}${end}${suffix}`}</span>
      <span aria-hidden="true">{prefix}{display}{suffix}</span>
    </strong>
  )
}
