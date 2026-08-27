import { ColorMixer } from '@/components/project/color-mixer'

const ACCENT = '#009fdb'

// El showcase ahora es directamente la feature real. La introducción a tu trabajo
// la hace la BridgeSection (el carrusel), que desemboca acá con el color ya filtrado.
export function ComexShowcase() {
  return (
    <section className="bg-[#fcfbf8] px-6 py-24 text-zinc-800">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          Design System · Comex
        </p>
        <h3 data-cursor-paint className="mb-5 text-2xl font-semibold text-zinc-900">
          Color Explorer and Mixer
        </h3>
        {/* TODO Milton: tu descripción real + el ownership end-to-end. */}
        <p data-cursor-paint className="mb-8 max-w-xl text-zinc-600">
          A tool I developed from end to end that allows users to explore color ranges and mix colors before purchasing—key for making confident decisions in a paint store.
        </p>
        {/* ColorMixer queda con su propio marco oscuro (bg-[#0b0b0c] adentro):
            es la "captura" de una herramienta real, no el chrome del sitio —
            por eso no se toca acá. Avisa data-cursor-surface="dark" adentro. */}
        <ColorMixer accent={ACCENT} />
      </div>
    </section>
  )
}
