'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

// Mismo naranja→amarillo en dos variantes según la superficie: "screen"
// brilla sobre fondo oscuro, "multiply" oscurece sobre fondo claro. Sin la
// variante correcta el aura casi desaparece sobre uno de los dos (screen
// sobre blanco no hace nada; multiply sobre negro tampoco).
const HALO_LIGHT =
  'radial-gradient(circle, rgba(255,157,63,0.16) 0%, rgba(255,210,63,0.08) 42%, transparent 72%)'
const HALO_DARK =
  'radial-gradient(circle, rgba(255,180,110,0.30) 0%, rgba(255,220,140,0.16) 42%, transparent 72%)'
const CORE_LIGHT = 'radial-gradient(circle, rgba(255,150,50,0.22) 0%, transparent 70%)'
const CORE_DARK = 'radial-gradient(circle, rgba(255,190,120,0.34) 0%, transparent 70%)'

/**
 * Capa atmosférica global: una aureola cálida (naranja→amarillo) que sigue
 * al cursor SIEMPRE — no espera a que pases sobre algo puntual, es el
 * acompañamiento ambiente del cursor en toda la página — + grano de fondo.
 * Vive fija al viewport (position: fixed) y se monta una sola vez en el
 * layout, así acompaña TODO el recorrido de scroll, no solo el Hero.
 *
 * Se contrasta con la superficie que tiene debajo, igual que hacía antes el
 * spotlight de <Cursor /> (esa pieza se retiró de ahí y quedó unificada acá,
 * como el único "aura" del cursor en vez de dos capas separadas):
 * - Superficie clara (el sitio, por defecto): "multiply".
 * - Superficie marcada `data-cursor-surface="dark"` (mockups/widgets con su
 *   propio marco oscuro, como el ColorMixer o las tarjetas de Bridge):
 *   "screen", para que siga siendo visible ahí también.
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
        haloEl.style.background = HALO_LIGHT
        coreEl.style.background = CORE_LIGHT

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

        // A diferencia del punto del cursor (que sí distingue hover), el
        // aura solo necesita saber una cosa del elemento que tiene debajo:
        // si es una superficie oscura, para no volverse invisible ahí.
        const onOver = (e: PointerEvent) => {
          const target = e.target as Element | null
          const onDark = !!target?.closest('[data-cursor-surface="dark"]')
          haloEl.style.background = onDark ? HALO_DARK : HALO_LIGHT
          coreEl.style.background = onDark ? CORE_DARK : CORE_LIGHT
          haloEl.classList.toggle('mix-blend-screen', onDark)
          haloEl.classList.toggle('mix-blend-multiply', !onDark)
          coreEl.classList.toggle('mix-blend-screen', onDark)
          coreEl.classList.toggle('mix-blend-multiply', !onDark)
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerover', onOver)

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
          window.removeEventListener('pointerover', onOver)
          breathe.kill()
        }
      })

      return () => mm.revert()
    },
    { scope: wrap },
  )

  return (
    <div ref={wrap} aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      {/* Halo: la masa de luz difusa que le da presencia al cursor. Achicado
          de nuevo a pedido (era 650px). */}
      <div
        ref={halo}
        className="absolute left-0 top-0 h-[480px] w-[480px] rounded-full opacity-0 mix-blend-multiply"
        style={{ filter: 'blur(40px)' }}
      />
      {/* Núcleo: más chico, más marcado y más rápido — el "shader" propiamente.
          También achicado (era 190px). */}
      <div
        ref={core}
        className="absolute left-0 top-0 h-[140px] w-[140px] rounded-full opacity-0 mix-blend-multiply"
        style={{ filter: 'blur(20px)' }}
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
