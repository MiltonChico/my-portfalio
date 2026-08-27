'use client'

import { ReactLenis, type LenisRef } from 'lenis/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Smooth scroll global con Lenis, sincronizado con GSAP.
 *
 * La clave: un SOLO loop de requestAnimationFrame. Lenis por defecto corre el
 * suyo; acá lo apagamos (autoRaf: false) y lo manejamos desde el ticker de GSAP.
 * Si dejás los dos loops corriendo en paralelo, las posiciones se desincronizan
 * y cualquier animación atada al scroll tiembla.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update(time: number) {
      // GSAP entrega el tiempo en segundos; Lenis lo quiere en milisegundos.
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0) // sin esto, una caída de FPS desincroniza el scroll

    // Cada vez que Lenis scrollea, le avisamos a ScrollTrigger para que recalcule.
    const lenis = lenisRef.current?.lenis
    lenis?.on('scroll', ScrollTrigger.update)

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
    }
  }, [])

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        // Scroll "pesado": lerp más bajo = tarda más en alcanzar el target
        // (más inercia). wheelMultiplier más bajo = cada tick de rueda mueve
        // un poco menos → sensación de resistencia. damp() es frame-rate
        // independiente, así que esto se siente igual a 60fps y a 144fps.
        lerp: 0.075,
        wheelMultiplier: 0.85,
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  )
}
