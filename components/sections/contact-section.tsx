'use client'

import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { FiLinkedin, FiMail } from 'react-icons/fi'

export function ContactSection() {
  const section = useRef<HTMLElement>(null)
  const head = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      if (!head.current) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const split = new SplitText(head.current!, { type: 'words' })
        const tween = gsap.from(split.words, {
          yPercent: 60,
          opacity: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section.current!,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        })
        return () => {
          tween.scrollTrigger?.kill()
          split.revert()
        }
      })

      return () => mm.revert()
    },
    { scope: section },
  )

  return (
    <section ref={section} className="relative overflow-hidden bg-[#0b0b0c] px-6 py-32 text-zinc-100">
      {/* Glow de marca insinuándose desde abajo, como cierre del recorrido de color. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: 'radial-gradient(50% 85% at 50% 100%, rgba(0,159,219,0.20) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="mb-5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">What&apos;s next</p>

        <h2 ref={head} className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Crafting more showcases to show.
        </h2>

        <p className="mt-6 text-zinc-400">In the meantime, you can reach me —</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <a
            href="https://www.linkedin.com/in/miltonchico/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-zinc-300 transition-colors hover:text-[#009fdb] focus-visible:text-[#009fdb] focus-visible:outline-none"
          >
            <FiLinkedin className="text-lg" aria-hidden />
            <span className="border-b border-transparent pb-0.5 group-hover:border-current group-focus-visible:border-current">
              linkedin.com/in/miltonchico
            </span>
          </a>

          <a
            href="mailto:milton.chico@outlook.com"
            className="group inline-flex items-center gap-2 text-zinc-300 transition-colors hover:text-[#009fdb] focus-visible:text-[#009fdb] focus-visible:outline-none"
          >
            <FiMail className="text-lg" aria-hidden />
            <span className="border-b border-transparent pb-0.5 group-hover:border-current group-focus-visible:border-current">
              milton.chico@outlook.com
            </span>
          </a>
        </div>

        <p className="mt-20 text-xs text-zinc-600">Milton — {new Date().getFullYear()}</p>
      </div>
    </section>
  )
}
