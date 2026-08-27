'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

const ACCENT = '#009fdb'

type Shape = { x: number; y: number; w: number; h: number; r: number; bg: string; bd?: boolean }
type Block = { complement: string; shapes: Shape[] }

// Cada bloque completa la frase tronco + ensambla la feature que representa.
// Editá los complementos para ajustar tu relato.
const BLOCKS: Block[] = [
  {
    complement: 'by crafting design systems from scratch.',
    shapes: [
      { x: 0, y: 0, w: 240, h: 220, r: 16, bg: '#161618', bd: true },
      { x: 24, y: 26, w: 130, h: 15, r: 7, bg: '#3f3f46' },
      { x: 24, y: 50, w: 84, h: 9, r: 5, bg: '#27272a' },
      { x: 24, y: 80, w: 192, h: 34, r: 10, bg: '#232327' },
      { x: 24, y: 122, w: 192, h: 34, r: 10, bg: '#232327' },
      { x: 24, y: 168, w: 192, h: 36, r: 10, bg: ACCENT },
    ],
  },
  {
    complement: 'by shipping accessible, reusable components.',
    shapes: [
      { x: 0, y: 0, w: 240, h: 220, r: 16, bg: '#161618', bd: true },
      { x: 24, y: 24, w: 110, h: 14, r: 7, bg: '#3f3f46' },
      { x: 24, y: 54, w: 52, h: 24, r: 12, bg: '#232327' },
      { x: 84, y: 54, w: 52, h: 24, r: 12, bg: '#232327' },
      { x: 144, y: 54, w: 52, h: 24, r: 12, bg: '#232327' },
      { x: 24, y: 100, w: 52, h: 28, r: 14, bg: '#232327' },
      { x: 52, y: 103, w: 22, h: 22, r: 11, bg: ACCENT },
      { x: 24, y: 148, w: 192, h: 22, r: 8, bg: '#1e1e21' },
      { x: 24, y: 178, w: 192, h: 22, r: 8, bg: '#1e1e21' },
    ],
  },
  {
    complement: 'by turning complex data into clarity.',
    shapes: [
      { x: 0, y: 0, w: 240, h: 220, r: 16, bg: '#161618', bd: true },
      { x: 24, y: 24, w: 100, h: 14, r: 7, bg: '#3f3f46' },
      { x: 30, y: 150, w: 26, h: 46, r: 6, bg: '#2f2f34' },
      { x: 68, y: 120, w: 26, h: 76, r: 6, bg: '#2f2f34' },
      { x: 106, y: 134, w: 26, h: 62, r: 6, bg: '#2f2f34' },
      { x: 144, y: 98, w: 26, h: 98, r: 6, bg: ACCENT },
      { x: 182, y: 142, w: 26, h: 54, r: 6, bg: '#2f2f34' },
    ],
  },
]

export function BridgeSection() {
  const section = useRef<HTMLElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const rowEl = row.current
      if (!rowEl) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const clamp = gsap.utils.clamp
        const back = gsap.parseEase('back.out(1.7)')
        const blockEls = gsap.utils.toArray<HTMLElement>('.bridge-block', rowEl)
        const shapeEls = blockEls.map((b) =>
          Array.from(b.querySelectorAll<HTMLElement>('.bridge-shape')),
        )

        // Modo animado: los bloques se posicionan absolutos y arrancan invisibles
        // (en reduced-motion quedan apilados en flujo normal, legibles, sin pin).
        gsap.set(blockEls, { position: 'absolute', left: '50%', top: '55%' })

        let spacing = Math.min(rowEl.clientWidth * 0.5, 380)

        const render = (p: number) => {
          const ap = p * 2 // 0..2 → índice de bloque activo
          if (glow.current) {
            glow.current.style.opacity = String(clamp(0, 1, (ap - 1.4) / 0.6) * 0.22)
          }
          blockEls.forEach((el, i) => {
            const d = i - ap
            const ad = Math.abs(d)
            const sc = clamp(0.62, 1.16, 1.16 - ad * 0.62) // emerge: chico lejos, grande al centro
            const op = clamp(0, 1, 1 - ad * 1.5) // aparece de la nada
            el.style.transform = `translate(-50%,-50%) translateX(${d * spacing}px) scale(${sc})`
            el.style.opacity = String(op)
            el.style.zIndex = String(100 - Math.round(ad * 10))

            const asm = clamp(0, 1, 1 - ad) // las formas se ensamblan al acercarse al centro
            shapeEls[i].forEach((sh, k) => {
              const spv = clamp(0, 1, (asm - k * 0.09) / 0.5)
              const e = back(spv)
              sh.style.opacity = String(clamp(0, 1, spv * 1.5))
              sh.style.transform = `translateY(${(1 - e) * 14}px) scale(${0.62 + 0.38 * e})`
            })
          })
        }

        const st = ScrollTrigger.create({
          trigger: section.current!,
          start: 'top top',
          end: '+=300%', // largo del pin: ~1 viewport por bloque + el cierre con color
          pin: true,
          onUpdate: (self) => render(self.progress),
          onRefresh: () => {
            spacing = Math.min(rowEl.clientWidth * 0.5, 380)
          },
        })

        render(0)
        return () => st.kill()
      })

      return () => mm.revert()
    },
    { scope: section },
  )

  return (
    <section ref={section} className="relative min-h-dvh overflow-hidden bg-[#fcfbf8] text-zinc-900">
      {/* Glow del color de marca: arranca apagado y se filtra al final → handoff al showcase.
          Opacidad tope más baja que antes (era *0.4): un cyan saturado a full
          se ve moody sobre negro pero cargoso sobre blanco. */}
      <div
        ref={glow}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{ background: `radial-gradient(60% 60% at 50% 60%, ${ACCENT} 0%, transparent 70%)` }}
      />

      {/* Frase tronco, anclada: cada bloque la completa. */}
      <p data-cursor-paint className="absolute inset-x-0 top-10 px-6 text-center text-base font-medium text-zinc-600 md:text-lg">
        Building modern and faster interfaces <span className="text-zinc-700">—</span>
      </p>

      <div ref={row} className="relative min-h-dvh">
        {BLOCKS.map((b, i) => (
          <div key={i} className="bridge-block relative mx-auto w-[300px] py-10 text-center">
            {/* Mini "device frame": queda oscuro a propósito, es un mockup de
                UI (piel propia), no el fondo del sitio — por eso también
                avisa data-cursor-surface="dark" para que el cursor use la
                variante de spotlight que se ve sobre superficies oscuras. */}
            <div className="relative mx-auto h-[220px] w-[240px]" data-cursor-surface="dark">
              {b.shapes.map((s, k) => (
                <div
                  key={k}
                  className="bridge-shape absolute"
                  style={{
                    left: s.x,
                    top: s.y,
                    width: s.w,
                    height: s.h,
                    borderRadius: s.r,
                    background: s.bg,
                    border: s.bd ? '1px solid rgba(255,255,255,0.08)' : undefined,
                  }}
                />
              ))}
            </div>
            <p data-cursor-paint className="mt-5 text-lg font-semibold text-zinc-900">
              {b.complement}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
