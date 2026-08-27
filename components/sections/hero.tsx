'use client'

import { useRef } from 'react'
import { useLenis } from 'lenis/react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap'

export function Hero() {
  const section = useRef<HTMLElement>(null)
  const name = useRef<HTMLHeadingElement>(null)
  const role = useRef<HTMLParagraphElement>(null)
  const cue = useRef<HTMLButtonElement>(null)
  const cueLabel = useRef<HTMLSpanElement>(null)
  const cueDot = useRef<HTMLSpanElement>(null)
  const lenis = useLenis()

  useGSAP(
    () => {
      if (!name.current) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Partimos el nombre en letras individuales.
        const split = new SplitText(name.current!, { type: 'chars' })

        // Animación de ENTRADA: se reproduce sola apenas carga la página, no
        // atada al scroll. El Hero tiene que estar completo apenas caés acá;
        // el scroll queda libre desde el primer frame (nada de pin).
        const tl = gsap.timeline({ delay: 0.15 })

        tl.from(split.chars, {
          yPercent: -140, // desde dónde caen (más negativo = caen de más arriba)
          opacity: 0,
          rotate: -6,
          ease: 'back.out(1.5)', // asentamiento con un rebote chico al aterrizar
          duration: 0.9,
          stagger: 0.035, // separación real (segundos) entre letras
        })

        // El rol y el scroll-cue entran justo después, mientras el nombre
        // todavía está asentando — se siente una sola secuencia, no dos.
        tl.from(
          role.current,
          { opacity: 0, y: 14, duration: 0.6, ease: 'power2.out' },
          '-=0.45',
        )
        tl.from(
          cue.current,
          { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' },
          '-=0.3',
        )

        // Loop ambiente del cue: una vez asentado, queda vivo todo el tiempo.
        // El dot cae y se estira como una gota (scaleY) mientras se desvanece;
        // el label respira despacio. Dos tweens en loop, no un GIF pegado.
        const dotLoop = gsap.fromTo(
          cueDot.current,
          { y: 0, scaleY: 1, opacity: 1 },
          {
            y: 18,
            scaleY: 1.8,
            opacity: 0,
            duration: 0.9,
            ease: 'power2.in',
            repeat: -1,
            repeatDelay: 0.35,
          },
        )
        const labelLoop = gsap.to(cueLabel.current, {
          y: -3,
          duration: 1.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })

        // Scroll-cue: desaparece apenas dejás el Hero (scrolleaste a la
        // siguiente sección), vuelve a aparecer si scrolleás para arriba y
        // reingresás. pointerEvents se apaga junto con la opacidad, así no
        // queda un botón invisible pero clickeable.
        const cueTrigger = ScrollTrigger.create({
          trigger: section.current!,
          start: 'top top',
          end: 'bottom top',
          onLeave: () => {
            if (cue.current) cue.current.style.pointerEvents = 'none'
            gsap.to(cue.current, { y: 24, opacity: 0, duration: 0.4, ease: 'power3.in' })
          },
          onEnterBack: () => {
            if (cue.current) cue.current.style.pointerEvents = 'auto'
            gsap.to(cue.current, { y: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.8)' })
          },
        })

        // SplitText modifica el DOM; hay que revertirlo a mano al limpiar.
        return () => {
          tl.kill()
          dotLoop.kill()
          labelLoop.kill()
          cueTrigger.kill()
          split.revert()
        }
      })

      return () => mm.revert()
    },
    { scope: section },
  )

  return (
    <section
      ref={section}
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#fcfbf8] px-6 text-zinc-900"
    >
      {/* Viñeta liviana para que los bordes se hundan un poco más que el centro.
          El glow y el grano ahora viven en <Atmosphere />, a nivel de layout,
          para acompañar todo el scroll y no solo este viewport. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#fcfbf8_100%)]"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1
          ref={name}
          data-cursor-paint
          className="text-[clamp(3rem,13vw,10rem)] font-extrabold uppercase leading-[0.88] tracking-tighter"
        >
          Milton Chico
        </h1>
        <p
          ref={role}
          data-cursor-paint
          className="mt-6 text-xl font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-2xl"
        >
          Frontend Engineer
        </p>
      </div>

      {/* Scroll cue anclado al borde del viewport inicial. Es un botón real:
          lleva a la siguiente sección con el mismo scroll suave de Lenis, no
          solo decorativo. Al ser <button>, el cursor ya lo detecta como
          "interactive" solo — no necesita data-cursor-paint. */}
      <button
        type="button"
        ref={cue}
        onClick={() => {
          const next = section.current?.nextElementSibling
          if (next) lenis?.scrollTo(next as HTMLElement, { duration: 1.4 })
        }}
        className="group absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 text-zinc-400 transition-colors hover:text-zinc-900 focus-visible:text-zinc-900 focus-visible:outline-none"
      >
        <span ref={cueLabel} className="text-[11px] uppercase tracking-[0.3em]">
          Scroll
        </span>
        <span className="flex h-8 w-5 items-start justify-center rounded-full border border-zinc-300 p-1.5 transition-colors group-hover:border-zinc-900 group-focus-visible:border-zinc-900">
          <span ref={cueDot} className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
        </span>
      </button>
    </section>
  )
}
