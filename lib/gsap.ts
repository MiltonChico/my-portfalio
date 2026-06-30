import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

// Registramos los plugins una sola vez para toda la app.
// Importá siempre desde acá, nunca de gsap directo. Solo desde Client Components,
// porque ScrollTrigger / SplitText / DrawSVG tocan el objeto window.
//
// SplitText y DrawSVG son gratis desde 2025 y vienen incluidos en el paquete gsap.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin)

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP }
