'use client'

import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'

export function Hero() {
  const section = useRef<HTMLElement>(null)
  const name = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      if (!name.current) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Partimos el nombre en letras individuales.
        const split = new SplitText(name.current!, { type: 'chars' })

        // El hero se PINNEA: queda fijo mientras scrolleás, y el scrub mapea tu
        // scroll al avance de la timeline → las letras caen al ritmo de tu dedo.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section.current!,
            start: 'top top',
            end: '+=120%', // largo del pin: cuánto scroll dura el armado del nombre
            scrub: true,
            pin: true,
          },
        })

        tl.from(split.chars, {
          yPercent: -140, // desde dónde caen (más negativo = caen de más arriba)
          opacity: 0,
          rotate: -6,
          ease: 'back.out(1.5)', // asentamiento con un rebote chico al aterrizar
          stagger: 0.6, // separación relativa entre letras
        })

        // Respiro al final: el nombre queda armado un toque antes de soltar el pin.
        tl.to({}, { duration: 0.4 })

        // SplitText modifica el DOM; hay que revertirlo a mano al limpiar.
        return () => split.revert()
      })

      return () => mm.revert()
    },
    { scope: section },
  )

  return (
    <section
      ref={section}
      className="flex min-h-dvh flex-col justify-end px-6 pb-[12vh]"
    >
      <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
        Frontend Engineer
      </p>
      <h1
        ref={name}
        className="text-[clamp(4rem,18vw,14rem)] font-extrabold leading-[0.9] tracking-tighter"
      >
        MILTON
      </h1>
    </section>
  )
}