'use client'
 
import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
 
export function About() {
  const section = useRef<HTMLElement>(null)
  const phrase = useRef<HTMLParagraphElement>(null)
 
  useGSAP(
    () => {
      if (!phrase.current) return
 
      const mm = gsap.matchMedia()
 
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Misma física de caída que el nombre, pero por PALABRA: una frase letra
        // por letra se vuelve ilegible, así que mantenemos el lenguaje de
        // movimiento y cambiamos la unidad.
        const split = new SplitText(phrase.current!, { type: 'words' })
 
        // Reveal liviano: NO pinneamos. Las palabras caen una vez, cuando la
        // sección entra al viewport (scroll normal, sin secuestrar el scroll).
        const tween = gsap.from(split.words, {
          yPercent: -100,
          opacity: 0,
          rotate: -4,
          ease: 'back.out(1.4)',
          stagger: 0.08,
          duration: 0.6,
          scrollTrigger: {
            trigger: section.current!,
            start: 'top 70%', // arranca cuando el borde superior cruza el 70% del viewport
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
    <section ref={section} className="flex min-h-dvh items-center px-6">
      <p
        ref={phrase}
        className="max-w-3xl text-balance text-[clamp(1.75rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight"
      >
       Building fast and modern interfaces.
      </p>
    </section>
  )
}
 