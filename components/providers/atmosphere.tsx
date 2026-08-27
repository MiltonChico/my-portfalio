'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

/**
 * Capa atmosférica global: una aureola que sigue al cursor + grano de fondo.
 * Vive fija al viewport (position: fixed) y se monta una sola vez en el
 * layout, así acompaña TODO el recorrido de scroll — no solo el Hero.
 *
 * Tema claro: fondo blanco, detalles en negro. Por eso el blend-mode es
 * "multiply" (oscurece lo que tiene debajo) en vez de "screen" (que sobre
 * blanco no hace nada). Si en el futuro alguna sección vuelve a ser oscura,
 * multiply ahí casi no se nota — degrada bien sin coordinarse sección por
 * sección, igual que pasaba antes con screen sobre las claras.
 */
export function Atmosphere() {
  const wrap = useRef<HTMLDivElement>(null)
  const halo = useRef<HTMLDivElement>(null)
  const core = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Solo con mouse real y si el usuario tolera motion — nada de esto
      // corre en touch ni con prefers-reduced-motion.
      mm.add('(prefers-reduced-motion: no-preference) and (pointer: fine)', () => {
        const haloEl = halo.current
        const coreEl = core.current
        if (!haloEl || !coreEl) return

        gsap.set([haloEl, coreEl], {
          opacity: 1,
          xPercent: -50,
          yPercent: -50,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        })

        // El núcleo persigue rápido, el halo va un pelo más atrás → sensación
        // de masa de luz con inercia propia, no un punto pegado al cursor.
        const setCoreX = gsap.quickTo(coreEl, 'x', { duration: 0.45, ease: 'power3' })
        const setCoreY = gsap.quickTo(coreEl, 'y', { duration: 0.45, ease: 'power3' })
        const setHaloX = gsap.quickTo(haloEl, 'x', { duration: 1, ease: 'power3' })
        const setHaloY = gsap.quickTo(haloEl, 'y', { duration: 1, ease: 'power3' })

        const onMove = (e: PointerEvent) => {
          setCoreX(e.clientX)
          setCoreY(e.clientY)
          setHaloX(e.clientX)
          setHaloY(e.clientY)
        }

        window.addEventListener('pointermove', onMove)

        // Respiración ambiente: sin esto, en cuanto dejás de mover el mouse
        // el halo se siente un sticker pegado en pantalla. Con esto sigue vivo.
        const breathe = gsap.to(haloEl, {
          scale: 1.18,
          duration: 4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })

        return () => {
          window.removeEventListener('pointermove', onMove)
          breathe.kill()
        }
      })

      return () => mm.revert()
    },
    { scope: wrap },
  )

  return (
    <div ref={wrap} aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      {/* Halo: la masa de sombra difusa que le da presencia real al cursor.
          Un poco más chica que antes (era 900px). */}
      <div
        ref={halo}
        className="absolute left-0 top-0 h-[650px] w-[650px] rounded-full opacity-0 mix-blend-multiply"
        style={{
          background:
            'radial-gradient(circle, rgba(41,37,32,0.10) 0%, rgba(41,37,32,0.05) 40%, transparent 72%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Núcleo: más chico, más marcado y más rápido — el "shader" propiamente.
          También reducido (era 260px). */}
      <div
        ref={core}
        className="absolute left-0 top-0 h-[190px] w-[190px] rounded-full opacity-0 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, rgba(20,18,16,0.14) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Grano global: acompaña toda la página, no solo el Hero. */}
      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
