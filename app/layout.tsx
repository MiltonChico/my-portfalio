import type { Metadata } from 'next'
import './globals.css'
import { SmoothScroll } from '@/components/providers/smooth-scroll'
import { Atmosphere } from '@/components/providers/atmosphere'
import { Cursor } from '@/components/providers/cursor'

// Si querés tus fuentes, mergeá acá el setup de next/font que genera
// create-next-app (por defecto Geist) y sumá su className al <body>.

export const metadata: Metadata = {
  title: 'Milton — Frontend Engineer',
  description: 'Portfolio de Milton, Frontend Engineer.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="bg-background text-foreground antialiased">
        <Atmosphere />
        <Cursor />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
