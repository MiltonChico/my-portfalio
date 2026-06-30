This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GSAP

# Portfolio — entorno base

Setup prolijo de un portafolio Frontend con Next.js (App Router) + Tailwind v4 +
GSAP + Lenis, con el smooth scroll ya sincronizado con el ticker de GSAP.

## 1. Crear el proyecto

Requiere Node 20.9+. El template por defecto ya trae TypeScript, Tailwind v4,
ESLint, App Router, Turbopack, alias `@/*` y `src/`:

```bash
npm create next-app@latest portfolio --yes
cd portfolio
```

## 2. Instalar dependencias extra

```bash
npm i gsap @gsap/react lenis react-icons
```

(GSAP es 100% gratis desde 2025, plugins incluidos — no necesitás token de acceso.)

## 3. Copiar / mergear estos archivos

```
src/
├─ app/
│  ├─ layout.tsx          ← envuelve todo en <SmoothScroll>
│  ├─ page.tsx            ← compone Hero + TechStackMarquee
│  └─ globals.css         ← Tailwind v4 + design tokens (reemplaza el generado)
├─ components/
│  ├─ providers/
│  │  └─ smooth-scroll.tsx   ← Lenis + ticker de GSAP (UN solo RAF)
│  └─ sections/
│     ├─ hero.tsx            ← placeholder (lo diseñamos después)
│     └─ tech-stack-marquee.tsx
└─ lib/
   └─ gsap.ts            ← registro central de plugins (useGSAP + ScrollTrigger)
```

Notas de merge:
- `globals.css`: reemplazá el que genera create-next-app (o sumá los tokens al tuyo).
- `layout.tsx`: si querés conservar las fuentes (Geist por defecto), mergeá el
  setup de `next/font` y sumá su `className` al `<body>`.

## 4. Levantar

```bash
npm run dev
```

## Por qué está armado así

- **`lib/gsap.ts`** centraliza el `registerPlugin`. Importá gsap / ScrollTrigger /
  useGSAP siempre desde ahí, nunca de `gsap` directo. Solo desde Client Components.
- **`smooth-scroll.tsx`** corre Lenis con `autoRaf: false` y lo maneja desde el
  ticker de GSAP → un único loop de RAF. Es el detalle que evita el temblor cuando
  metas animaciones atadas al scroll más adelante. Ya deja `lenis.on('scroll',
  ScrollTrigger.update)` conectado.
- **`tech-stack-marquee.tsx`** es el componente que armamos: loop infinito sin
  costura (xPercent -50, repeat -1), velocidad lenta configurable, links accesibles
  y `prefers-reduced-motion` respetado.

## Próximo paso

Diseñar el hero (`src/components/sections/hero.tsx`), que es la pieza más
importante de la página.

