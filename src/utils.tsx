import React, { useEffect, useRef } from 'react'

export function useFadeIn() {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          obs.unobserve(el)
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return ref
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < n ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

export function SectionLabel({ text, light }: { text: string; light?: boolean }) {
  return <p className={`sec-label${light ? ' sec-label--light' : ''}`}>{text}</p>
}

export function Counter({ value }: { value: string }) {
  const [count, setCount] = React.useState(0)
  const target = parseInt(value.replace(/\D/g, ''))
  const suffix = value.replace(/\d/g, '')
  const ref = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    let startTime: number | null = null
    const duration = 2000
    const animate = (now: number) => {
      if (!startTime) startTime = now
      const progress = Math.min((now - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isVisible, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export function FadeSection({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useFadeIn()
  return (
    <section
      id={id}
      ref={ref as React.RefObject<HTMLElement>}
      className={`fade-section ${className}`.trim()}
    >
      {children}
    </section>
  )
}
