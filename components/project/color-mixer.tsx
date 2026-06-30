'use client'

import { useMemo, useState } from 'react'

type Swatch = { hex: string; name: string }

// Representativo: gamas y colores de muestra. Ajustá a las gamas reales de tu
// feature (y si estaban atadas a producto, agregá ese nivel).
const GAMAS: Record<string, Swatch[]> = {
  Neutrals: [
    { hex: '#f5f3ee', name: 'Linen' }, { hex: '#e6e1d6', name: 'Sand' },
    { hex: '#cfc8ba', name: 'Stone' }, { hex: '#b3aa98', name: 'Taupe' },
    { hex: '#8c8475', name: 'Ash' }, { hex: '#6b6557', name: 'Smoke' },
    { hex: '#4a463d', name: 'Shadow' }, { hex: '#2e2b25', name: 'Charcoal' },
    { hex: '#9b9384', name: 'Greige' }, { hex: '#bcae99', name: 'Oat' },
    { hex: '#d8d2c4', name: 'Bone' }, { hex: '#7a7163', name: 'Fawn' },
  ],
  Blues: [
    { hex: '#009fdb', name: 'Comex Cyan' }, { hex: '#0a6ea8', name: 'Navy' },
    { hex: '#0d4f7c', name: 'Deep' }, { hex: '#3bb0e6', name: 'Sky' },
    { hex: '#7fcbe8', name: 'Breeze' }, { hex: '#bfe3f3', name: 'Ice' },
    { hex: '#1b3a5c', name: 'Indigo' }, { hex: '#2e86c1', name: 'Lake' },
    { hex: '#5dade2', name: 'Serene' }, { hex: '#154360', name: 'Abyss' },
    { hex: '#85c1e9', name: 'Mist' }, { hex: '#1a5276', name: 'Ink' },
  ],
  Greens: [
    { hex: '#2e8b57', name: 'Forest' }, { hex: '#52b788', name: 'Mint' },
    { hex: '#95d5b2', name: 'Sage' }, { hex: '#1b4332', name: 'Pine' },
    { hex: '#74c69d', name: 'Jade' }, { hex: '#40916c', name: 'Leaf' },
    { hex: '#6a994e', name: 'Olive' }, { hex: '#a7c957', name: 'Lime' },
    { hex: '#386641', name: 'Moss' }, { hex: '#d8f3dc', name: 'Dew' },
    { hex: '#2d6a4f', name: 'Jungle' }, { hex: '#b7e4c7', name: 'Linden' },
  ],
  Warm: [
    { hex: '#e63946', name: 'Red' }, { hex: '#f4a261', name: 'Peach' },
    { hex: '#e76f51', name: 'Coral' }, { hex: '#f6bd60', name: 'Honey' },
    { hex: '#ee6c4d', name: 'Tile' }, { hex: '#ffba08', name: 'Sun' },
    { hex: '#d62828', name: 'Crimson' }, { hex: '#f77f00', name: 'Mango' },
    { hex: '#fcbf49', name: 'Amber' }, { hex: '#bc4749', name: 'Brick' },
    { hex: '#ffd166', name: 'Mustard' }, { hex: '#e85d04', name: 'Orange' },
  ],
  Earth: [
    { hex: '#7f5539', name: 'Cocoa' }, { hex: '#9c6644', name: 'Earth' },
    { hex: '#b08968', name: 'Clay' }, { hex: '#ddb892', name: 'Caramel' },
    { hex: '#6f4518', name: 'Coffee' }, { hex: '#a68a64', name: 'Sahara' },
    { hex: '#bc8a5f', name: 'Copper' }, { hex: '#8b5e34', name: 'Walnut' },
    { hex: '#c79a6f', name: 'Wheat' }, { hex: '#deab90', name: 'Terracotta' },
    { hex: '#583101', name: 'Chocolate' }, { hex: '#4a2c11', name: 'Ebony' },
  ],
}

const MAX = 5

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '')
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]
}
function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

export function ColorMixer({ accent = '#009fdb' }: { accent?: string }) {
  const names = Object.keys(GAMAS)
const [active, setActive] = useState(names[0])
  const [palette, setPalette] = useState<Swatch[]>([])
  const [hover, setHover] = useState('')

  // "Mezcla" representativa: promedio RGB de la paleta. Si tu feature mezclaba
  // distinto (blend de dos pinturas, armonías, etc.), cambiá solo este cálculo.
  const mezcla = useMemo(() => {
    if (!palette.length) return null
    const sum = palette.reduce<[number, number, number]>(
      (a, s) => { const [r, g, b] = hexToRgb(s.hex); return [a[0] + r, a[1] + g, a[2] + b] },
      [0, 0, 0],
    )
    return rgbToHex([sum[0] / palette.length, sum[1] / palette.length, sum[2] / palette.length])
  }, [palette])

  const add = (s: Swatch) =>
    setPalette((p) => (p.length < MAX && !p.some((x) => x.hex === s.hex) ? [...p, s] : p))
  const remove = (i: number) => setPalette((p) => p.filter((_, idx) => idx !== i))

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0b0c] p-5 text-zinc-200">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-[15px] font-semibold text-zinc-50">Color Palette</span>
        <span className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">+3.500 colours</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {names.map((g) => {
          const on = g === active
          return (
            <button
              key={g}
              onClick={() => setActive(g)}
              style={on ? { background: accent, borderColor: accent, color: '#04141b' } : undefined}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                on ? 'font-semibold' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              {g}
            </button>
          )
        })}
      </div>

      <div className="mb-5 grid grid-cols-6 gap-2">
        {GAMAS[active].map((s) => (
          <button
            key={s.hex}
            onClick={() => add(s)}
            onMouseEnter={() => setHover(`${s.name} · ${s.hex}`)}
            onMouseLeave={() => setHover('')}
            aria-label={`${s.name} ${s.hex}`}
            style={{ background: s.hex }}
            className="aspect-square rounded-lg border border-white/10 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          />
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[180px] flex-1">
          <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-zinc-500">
            Your palette · click to remove
          </p>
          <div className="flex gap-2">
            {Array.from({ length: MAX }).map((_, i) => {
              const s = palette[i]
              return s ? (
                <button
                  key={i}
                  onClick={() => remove(i)}
                  title={`${s.name} ${s.hex}`}
                  style={{ background: s.hex }}
                  className="h-[38px] w-[38px] rounded-lg border border-white/15"
                />
              ) : (
                <div key={i} className="h-[38px] w-[38px] rounded-lg border border-dashed border-zinc-700" />
              )
            })}
          </div>
          <p className="mt-2.5 min-h-4 text-xs text-zinc-500">{hover}</p>
        </div>

        <div className="text-center">
          <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-zinc-500">Mix</p>
          <div
            style={{ background: mezcla ?? '#141416' }}
            className="mx-auto mb-1.5 h-[62px] w-[84px] rounded-xl border border-white/15 transition-colors"
          />
          <p className="text-xs tabular-nums text-zinc-400">{mezcla ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
