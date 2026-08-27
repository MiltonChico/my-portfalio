'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

type Mode = 'idle' | 'active'

// Mismo naranja→amarillo en dos variantes según la superficie: "screen"
// brilla sobre fondo oscuro, "multiply" oscurece sobre fondo claro. Sin la
// variante correcta, el spotlight prácticamente desaparece sobre uno de los
// dos (screen sobre blanco no hace nada; multiply sobre negro tampoco).
const SPOT_LIGHT =
  'radial-gradient(circle, rgba(255,179,71,0.5) 0%, rgba(255,224,102,0.3) 45%, transparent 75%)'
const SPOT_DARK =
  'radial-gradient(circle, rgba(255,183,110,0.5) 0%, rgba(255,224,140,0.28) 45%, transparent 75%)'

/**
 * Cursor a medida: reemplaza el puntero nativo por un punto — SIEMPRE la
 * misma forma y tamaño, no crece al pasar sobre nada — y dispara dos cosas
 * sobre elementos "activos" (texto marcado con `data-cursor-paint`,
 * botones, links, tarjetas del stack tecnológico):
 *
 * 1. Un spotlight cálido naranja→amarillo anclado al cursor (glow de fondo).
 * 2. El propio `--cursor-x`/`--cursor-y` en <html>, en px de viewport, que
 *    `globals.css` usa para "pintar" el TEXTO mismo (ver la regla ahí — un
 *    texto negro no cambia de color con ningún blend-mode porque multiply/
 *    screen no le sacan color a un píxel negro puro; hace falta clipear una
 *    versión cálida del texto y revelarla solo cerca del cursor).
 *
 * El spotlight se contrasta con la superficie que tiene debajo:
 * - Superficie clara (el sitio, por defecto): spotlight en "multiply".
 * - Superficie marcada `data-cursor-surface="dark"` (mockups/widgets con su
 *   propio marco oscuro, como el ColorMixer o las tarjetas de Bridge):
 *   spotlight en "screen", para que siga siendo visible ahí también.
 *
 * Para sumar un elemento a este sistema en cualquier sección alcanza con el
 * atributo — no hace falta tocar este archivo.
 *
 * Se apaga solo (queda el cursor nativo) en touch y con
 * prefers-reduced-motion: nunca desaparece sin reemplazo.
 */
export function Cursor() {
  const wrap = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const dotBase = useRef<HTMLDivElement>(null)
  const dotWarm = useRef<HTMLDivElement>(null)
  const spotlight = useRef<HTMLDivElement>(null)
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
          const spotEl = spotlight.current
          const root = document.documentElement
          if (!dotEl || !baseEl || !warmEl || !spotEl) return

          // Con el cursor de reemplazo activo, apagamos el nativo global
          // (ver globals.css: la regla vive detrás de esta misma clase, así
          // que si este efecto no corre — reduced motion, touch — el cursor
          // del sistema nunca desaparece).
          root.classList.add('custom-cursor')

          gsap.set([dotEl, spotEl], {
            xPercent: -50,
            yPercent: -50,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          })
          gsap.set(dotEl, { opacity: 1 })
          spotEl.style.background = SPOT_LIGHT

          // El punto persigue casi 1:1 (duration corta): tiene que sentirse
          // el cursor mismo, no un elemento que lo sigue con delay. El
          // spotlight va un pelo más suave, es una masa de luz, no un punto.
          const setDotX = gsap.quickTo(dotEl, 'x', { duration: 0.12, ease: 'power3' })
          const setDotY = gsap.quickTo(dotEl, 'y', { duration: 0.12, ease: 'power3' })
          const setSpotX = gsap.quickTo(spotEl, 'x', { duration: 0.25, ease: 'power3' })
          const setSpotY = gsap.quickTo(spotEl, 'y', { duration: 0.25, ease: 'power3' })

          const onMove = (e: PointerEvent) => {
            setDotX(e.clientX)
            setDotY(e.clientY)
            setSpotX(e.clientX)
            setSpotY(e.clientY)
            // Sin easing, a propósito: esto posiciona el "revelado" cálido
            // del texto (globals.css), y tiene que quedar pegado a la punta
            // real del cursor, no arrastrarse detrás como el spotlight.
            root.style.setProperty('--cursor-x', `${e.clientX}px`)
            root.style.setProperty('--cursor-y', `${e.clientY}px`)
          }

          const applyMode = (next: Mode, onDark: boolean) => {
            const changed = mode.current !== next
            mode.current = next

            if (changed) {
              // Crossfade entre el punto "difference" (default, siempre
              // visible sin importar qué haya debajo) y el punto con el
              // color cálido sólido — mix-blend-mode no se puede animar, por
              // eso son dos capas separadas en vez de una sola. La forma y
              // el tamaño del punto nunca cambian, solo el color.
              gsap.to(baseEl, { opacity: next === 'active' ? 0 : 1, duration: 0.25 })
              gsap.to(warmEl, { opacity: next === 'active' ? 1 : 0, duration: 0.25 })
              gsap.to(spotEl, {
                opacity: next === 'active' ? 1 : 0,
                duration: 0.4,
                ease: 'power2.out',
              })
            }

            // La variante de superficie puede cambiar sin que el modo
            // cambie (ej: ir de un texto activo sobre fondo claro a un
            // botón activo sobre el ColorMixer sin pasar por "idle" en el
            // medio) — por eso se recalcula siempre, no solo en `changed`.
            spotEl.style.background = onDark ? SPOT_DARK : SPOT_LIGHT
            spotEl.classList.toggle('mix-blend-screen', onDark)
            spotEl.classList.toggle('mix-blend-multiply', !onDark)
          }

          // pointerover (no pointermove): solo nos importa cuando cruzás un
          // borde de elemento, no en cada pixel de movimiento.
          const onOver = (e: PointerEvent) => {
            const target = e.target as Element | null
            if (!target) return
            const active = target.closest('a, button, [data-cursor-paint]')
            const onDark = !!target.closest('[data-cursor-surface="dark"]')
            applyMode(active ? 'active' : 'idle', onDark)
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
      {/* Spotlight cálido: invisible salvo sobre elementos "activos". El
          background y el blend-mode los pisa JS (ver SPOT_LIGHT/SPOT_DARK)
          según la superficie — por eso no lleva mix-blend-* fijo en className.
          Un poco más chico que antes (era 420px). */}
      <div
        ref={spotlight}
        className="absolute left-0 top-0 h-[320px] w-[320px] rounded-full opacity-0"
        style={{ filter: 'blur(26px)' }}
      />

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
            mismo naranja→amarillo del spotlight, a propósito, no por azar. */}
        <div
          ref={dotWarm}
          className="absolute inset-0 rounded-full opacity-0"
          style={{ background: 'linear-gradient(135deg, #ff9d3f, #ffd23f)' }}
        />
      </div>
    </div>
  )
}
