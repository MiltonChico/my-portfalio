'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

type Mode = 'idle' | 'active'

/**
 * Cursor a medida: reemplaza el puntero nativo por un punto — SIEMPRE la
 * misma forma y tamaño, no crece al pasar sobre nada — que dispara dos cosas
 * sobre elementos "activos" (texto marcado con `data-cursor-paint`,
 * botones, links, tarjetas del stack tecnológico):
 *
 * 1. El propio punto se tiñe del naranja→amarillo cálido (crossfade de
 *    color, no de tamaño).
 * 2. `--cursor-x`/`--cursor-y` en <html>, en px de viewport, que
 *    `globals.css` usa para "pintar" el TEXTO mismo (ver la regla ahí — un
 *    texto negro no cambia de color con ningún blend-mode porque multiply/
 *    screen no le sacan color a un píxel negro puro; hace falta clipear una
 *    versión cálida del texto y revelarla solo cerca del cursor).
 *
 * El aura difusa que acompaña al cursor (antes vivía acá como "spotlight",
 * solo al hacer hover) ahora vive en <Atmosphere /> y está siempre
 * encendida, no es exclusiva de este componente — ver ese archivo.
 *
 * Se apaga solo (queda el cursor nativo) en touch y con
 * prefers-reduced-motion: nunca desaparece sin reemplazo.
 */
export function Cursor() {
  const wrap = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const dotBase = useRef<HTMLDivElement>(null)
  const dotWarm = useRef<HTMLDivElement>(null)
  const mode = useRef<Mode>('idle')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        '(prefers-reduced-motion: no-preference) and (pointer: fine) and (hover: hover)',
        () => {
          const dotEl = dot.current
          const baseEl = dotBase.current
          const warmEl = dotWarm.current
          const root = document.documentElement
          if (!dotEl || !baseEl || !warmEl) return

          // Con el cursor de reemplazo activo, apagamos el nativo global
          // (ver globals.css: la regla vive detrás de esta misma clase, así
          // que si este efecto no corre — reduced motion, touch — el cursor
          // del sistema nunca desaparece).
          root.classList.add('custom-cursor')

          gsap.set(dotEl, {
            opacity: 1,
            xPercent: -50,
            yPercent: -50,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          })

          // El punto persigue casi 1:1 (duration corta): tiene que sentirse
          // el cursor mismo, no un elemento que lo sigue con delay.
          const setDotX = gsap.quickTo(dotEl, 'x', { duration: 0.12, ease: 'power3' })
          const setDotY = gsap.quickTo(dotEl, 'y', { duration: 0.12, ease: 'power3' })

          const onMove = (e: PointerEvent) => {
            setDotX(e.clientX)
            setDotY(e.clientY)
            // Sin easing, a propósito: esto posiciona el "revelado" cálido
            // del texto (globals.css), y tiene que quedar pegado a la punta
            // real del cursor, no arrastrarse detrás.
            root.style.setProperty('--cursor-x', `${e.clientX}px`)
            root.style.setProperty('--cursor-y', `${e.clientY}px`)
          }

          const applyMode = (next: Mode) => {
            if (mode.current === next) return
            mode.current = next

            // Crossfade entre el punto "difference" (default, siempre
            // visible sin importar qué haya debajo) y el punto con el color
            // cálido sólido — mix-blend-mode no se puede animar, por eso son
            // dos capas separadas en vez de una sola. La forma y el tamaño
            // del punto nunca cambian, solo el color.
            gsap.to(baseEl, { opacity: next === 'active' ? 0 : 1, duration: 0.25 })
            gsap.to(warmEl, { opacity: next === 'active' ? 1 : 0, duration: 0.25 })
          }

          // pointerover (no pointermove): solo nos importa cuando cruzás un
          // borde de elemento, no en cada pixel de movimiento.
          const onOver = (e: PointerEvent) => {
            const target = e.target as Element | null
            if (!target) return
            const active = target.closest('a, button, [data-cursor-paint]')
            applyMode(active ? 'active' : 'idle')
          }

          window.addEventListener('pointermove', onMove)
          window.addEventListener('pointerover', onOver)

          return () => {
            root.classList.remove('custom-cursor')
            root.style.removeProperty('--cursor-x')
            root.style.removeProperty('--cursor-y')
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerover', onOver)
          }
        },
      )

      return () => mm.revert()
    },
    { scope: wrap },
  )

  return (
    <div ref={wrap} aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      {/* El punto: reemplaza al cursor nativo. Tamaño y forma fijos siempre
          — solo cambia de color (crossfade de opacidad entre dos capas, ver
          arriba por qué no es una sola capa con mix-blend-mode animado). */}
      <div ref={dot} className="absolute left-0 top-0 h-5 w-5 opacity-0">
        {/* Default: blanco + difference → visible sobre cualquier fondo sin
            coordinar color sección por sección (ya "contrasta" solo). */}
        <div
          ref={dotBase}
          className="absolute inset-0 rounded-full bg-white mix-blend-difference"
        />
        {/* Active: color sólido cálido, blend normal — el cursor "recoge" el
            mismo naranja→amarillo del aura, a propósito, no por azar. */}
        <div
          ref={dotWarm}
          className="absolute inset-0 rounded-full opacity-0"
          style={{ background: 'linear-gradient(135deg, #ff9d3f, #ffd23f)' }}
        />
      </div>
    </div>
  )
}
