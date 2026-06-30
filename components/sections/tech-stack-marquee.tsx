'use client'

import { useRef, type HTMLAttributes } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import type { IconType } from 'react-icons'
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiRedux,
  SiTailwindcss,
  SiGraphql,
  SiCypress,
  SiNodedotjs,
  SiWebpack,
  SiJest,
} from 'react-icons/si'

type Tech = { name: string; Icon: IconType; href: string }

const STACK: Tech[] = [
  { name: 'React', Icon: SiReact, href: 'https://react.dev' },
  { name: 'Next.js', Icon: SiNextdotjs, href: 'https://nextjs.org' },
  { name: 'TypeScript', Icon: SiTypescript, href: 'https://www.typescriptlang.org' },
  { name: 'JavaScript', Icon: SiJavascript, href: 'https://developer.mozilla.org/docs/Web/JavaScript' },
  { name: 'Redux', Icon: SiRedux, href: 'https://redux.js.org' },
  { name: 'Tailwind CSS', Icon: SiTailwindcss, href: 'https://tailwindcss.com' },
  { name: 'GraphQL', Icon: SiGraphql, href: 'https://graphql.org' },
  { name: 'Cypress', Icon: SiCypress, href: 'https://www.cypress.io' },
  { name: 'Node.js', Icon: SiNodedotjs, href: 'https://nodejs.org' },
  { name: 'Webpack', Icon: SiWebpack, href: 'https://webpack.js.org' },
  { name: 'Jest', Icon: SiJest, href: 'https://jestjs.io' },
]

type Props = {
  /** Velocidad de la cinta en píxeles por segundo. Más bajo = más calmo. */
  speed?: number
}

export function TechStackMarquee({ speed = 45 }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = track.current
      if (!el) return

      // Respetamos prefers-reduced-motion: si el usuario pidió menos movimiento,
      // no creamos ninguna animación y la cinta queda quieta.
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        let tween: gsap.core.Tween | undefined

        const build = () => {
          // El track tiene dos sets idénticos. Movemos -50% (un set entero):
          // cuando el set 1 sale por la izquierda, el set 2 ocupa su lugar exacto,
          // así el salto de -50% de vuelta a 0% es invisible (loop sin costura).
          const setWidth = el.scrollWidth / 2
          const progress = tween?.progress() ?? 0 // preservamos la posición al recalcular
          tween?.kill()
          tween = gsap.to(el, {
            xPercent: -50,
            ease: 'none',
            duration: setWidth / speed, // duración derivada de la velocidad deseada
            repeat: -1,
          })
          tween.progress(progress)
        }

        build()

        // Si cambia el tamaño (responsive / cambio de viewport), recalculamos la
        // duración para que la velocidad real en px/s se mantenga constante.
        const ro = new ResizeObserver(build)
        ro.observe(el)

        return () => {
          ro.disconnect()
          tween?.kill()
        }
      })

      // useGSAP revierte el contexto al desmontar; revertimos también el matchMedia.
      return () => mm.revert()
    },
    { scope: container, dependencies: [speed] },
  )

  return (
    <div
      ref={container}
      aria-label="Stack tecnológico"
      className="relative overflow-hidden py-6"
      style={{
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
      }}
    >
      <div ref={track} className="flex w-max gap-3.5 will-change-transform">
        <LogoSet />
        {/*
          Set clonado: existe solo para la costura visual del loop.
          Lo ocultamos a lectores de pantalla (aria-hidden) y lo sacamos del orden
          de tabulación (tabbable=false), así cada tecnología cuenta una sola vez.
        */}
        <LogoSet aria-hidden tabbable={false} />
      </div>
    </div>
  )
}

function LogoSet({
  tabbable = true,
  ...rest
}: { tabbable?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex shrink-0 gap-3.5" {...rest}>
      {STACK.map(({ name, Icon, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} — sitio oficial`}
          tabIndex={tabbable ? 0 : -1}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-muted-foreground transition-[color,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon className="text-xl" aria-hidden />
          <span className="text-sm">{name}</span>
        </a>
      ))}
    </div>
  )
}
