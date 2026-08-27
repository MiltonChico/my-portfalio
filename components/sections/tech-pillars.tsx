'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import type { IconType } from 'react-icons'
import {
  SiReact,
  SiJavascript,
  SiNextdotjs,
  SiTailwindcss,
  SiSass,
  SiStorybook,
  SiNodedotjs,
  SiMysql,
} from 'react-icons/si'

type Pillar = {
  name: string
  Icon: IconType
  href: string
  /** Fondo de la tarjeta: el color de marca de la tecnología, a propósito
   *  saturado — la idea es que la tarjeta SEA el color, no un ícono chico
   *  sobre gris. */
  bg: string
  fg: string
  /** Fondo oscuro → el aura del cursor (`<Atmosphere />`) necesita saberlo
   *  para pasar a su variante "screen", si no se vuelve invisible ahí. */
  dark?: boolean
  // Posición de reposo "desparejo": cada tarjeta con su propio offset y
  // rotación chica — fotos tiradas sobre una mesa, no una grilla prolija.
  x: number
  y: number
  rotate: number
}

// Tres filas, cada una con su propio scroll-trigger (ver más abajo): se
// revelan una después de la otra a medida que las alcanzás, no todas juntas
// apenas entra la sección.
const CORE: Pillar[] = [
  {
    name: 'React',
    Icon: SiReact,
    href: 'https://react.dev',
    bg: '#0b1120',
    fg: '#61dafb',
    dark: true,
    x: -6,
    y: 16,
    rotate: -4,
  },
  {
    name: 'JavaScript',
    Icon: SiJavascript,
    href: 'https://developer.mozilla.org/docs/Web/JavaScript',
    bg: '#f7df1e',
    fg: '#0b0b0c',
    x: 14,
    y: -24,
    rotate: 3,
  },
  {
    name: 'Next.js',
    Icon: SiNextdotjs,
    href: 'https://nextjs.org',
    bg: '#0b0b0c',
    fg: '#ffffff',
    dark: true,
    x: -10,
    y: 32,
    rotate: -2.5,
  },
]

const ALSO_USING: Pillar[] = [
  {
    name: 'Tailwind CSS',
    Icon: SiTailwindcss,
    href: 'https://tailwindcss.com',
    bg: '#0ea5e9',
    fg: '#ffffff',
    x: 10,
    y: 20,
    rotate: 2.5,
  },
  {
    name: 'Sass',
    Icon: SiSass,
    href: 'https://sass-lang.com',
    bg: '#cc6699',
    fg: '#ffffff',
    x: -12,
    y: -18,
    rotate: -3,
  },
  {
    name: 'Storybook',
    Icon: SiStorybook,
    href: 'https://storybook.js.org',
    bg: '#ff4785',
    fg: '#ffffff',
    x: 8,
    y: 26,
    rotate: 3.5,
  },
]

const BACKEND: Pillar[] = [
  {
    name: 'Node.js',
    Icon: SiNodedotjs,
    href: 'https://nodejs.org',
    bg: '#339933',
    fg: '#ffffff',
    x: -8,
    y: 14,
    rotate: -3,
  },
  {
    name: 'MySQL',
    Icon: SiMysql,
    href: 'https://www.mysql.com',
    bg: '#4479a1',
    fg: '#ffffff',
    x: 10,
    y: -16,
    rotate: 2.5,
  },
]

export function TechPillars() {
  const section = useRef<HTMLDivElement>(null)
  const coreRow = useRef<HTMLDivElement>(null)
  const alsoRow = useRef<HTMLDivElement>(null)
  const backendRow = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const allCards = gsap.utils.toArray<HTMLElement>('.tech-pillar', section.current!)
      if (!allCards.length) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Cada fila revela por su cuenta cuando LA ALCANZÁS scrolleando, no
        // todas de una — así se siente "más presencia" a medida que avanzás
        // por la sección, no un solo golpe al entrar.
        const setupRow = (rowEl: HTMLDivElement | null, items: Pillar[]) => {
          if (!rowEl) return () => {}
          const cards = gsap.utils.toArray<HTMLElement>('.tech-pillar', rowEl)
          if (!cards.length) return () => {}

          // Reposo disperso primero (sincrónico, sin flash): cada tarjeta a
          // su x/y/rotate propio.
          gsap.set(cards, {
            x: (i) => items[i].x,
            y: (i) => items[i].y,
            rotate: (i) => items[i].rotate,
          })

          // Bajan de manera prolija y delicada, izquierda a derecha (el
          // orden del array = el orden del stagger) — sin rebote, a
          // diferencia del Hero: acá el pedido fue explícitamente "delicada".
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rowEl,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          })

          tl.from(cards, {
            y: (i) => items[i].y - 90, // caen desde 90px más arriba de su reposo
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.18,
          })

          return () => {
            tl.scrollTrigger?.kill()
            tl.kill()
          }
        }

        const cleanupCore = setupRow(coreRow.current, CORE)
        const cleanupAlso = setupRow(alsoRow.current, ALSO_USING)
        const cleanupBackend = setupRow(backendRow.current, BACKEND)

        return () => {
          cleanupCore()
          cleanupAlso()
          cleanupBackend()
        }
      })

      // Lift al hover: no es decorativo, es feedback de interacción — corre
      // siempre, incluso con reduced-motion. Relativo (+=/-=) para no pisar
      // el x/y/rotate de reposo que puso el bloque de arriba.
      const cleanups = allCards.map((card) => {
        const onEnter = () =>
          gsap.to(card, { y: '-=10', scale: 1.04, duration: 0.3, ease: 'power2.out' })
        const onLeave = () =>
          gsap.to(card, { y: '+=10', scale: 1, duration: 0.4, ease: 'power2.out' })
        card.addEventListener('pointerenter', onEnter)
        card.addEventListener('pointerleave', onLeave)
        return () => {
          card.removeEventListener('pointerenter', onEnter)
          card.removeEventListener('pointerleave', onLeave)
        }
      })

      return () => {
        mm.revert()
        cleanups.forEach((fn) => fn())
      }
    },
    { scope: section },
  )

  return (
    <div ref={section} className="px-6 pb-24 pt-4 sm:pb-32 sm:pt-8">
      <Row label="Core stack" rowRef={coreRow} items={CORE} />
      <Row label="Also using" rowRef={alsoRow} items={ALSO_USING} className="mt-24 sm:mt-32" />
      <Row label="Backend" rowRef={backendRow} items={BACKEND} className="mt-24 sm:mt-32" />
    </div>
  )
}

function Row({
  label,
  rowRef,
  items,
  className = '',
}: {
  label: string
  rowRef: React.RefObject<HTMLDivElement | null>
  items: Pillar[]
  className?: string
}) {
  return (
    <div ref={rowRef} className={className}>
      <p className="mb-10 text-center text-sm uppercase tracking-[0.18em] text-zinc-500 sm:mb-14">
        {label}
      </p>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-14 sm:gap-20">
        {items.map(({ name, Icon, href, bg, fg, dark, y, rotate }) => (
          // Wrapper "group": el nombre de abajo se revela con el hover de la
          // tarjeta (grupo = card + label comparten el mismo :hover). Altura
          // del label fija (h-5) aunque esté invisible, así aparecer no
          // empuja nada — solo cambia opacidad/posición, no layout.
          //
          // El x/y/rotate de la tarjeta lo aplica GSAP como transform — eso
          // es puramente visual, no mueve el layout real. Sin esto, una
          // tarjeta con y positivo (baja) se pisa con su propio label de
          // abajo, y la rotación agranda un poco su caja visual (las
          // esquinas sobresalen). Por eso el margen de acá es data-driven:
          // 20px base + lo que la tarjeta baja + un poco por la rotación,
          // en vez de un margen fijo igual para todas.
          <div key={name} className="group flex flex-col items-center">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} — sitio oficial`}
              data-cursor-surface={dark ? 'dark' : undefined}
              className="tech-pillar flex h-28 w-28 shrink-0 items-center justify-center rounded-[28px] shadow-sm transition-shadow duration-300 hover:shadow-lg sm:h-36 sm:w-36 md:h-44 md:w-44"
              style={{ background: bg }}
            >
              <Icon style={{ color: fg }} className="text-5xl sm:text-6xl md:text-7xl" aria-hidden />
            </a>
            <span
              className="block h-5 translate-y-1 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
              style={{ marginTop: `${20 + Math.max(0, y) + Math.abs(rotate) * 2}px` }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
