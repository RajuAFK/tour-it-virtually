import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TourItVirtually — Explore the World in 360°',
  description: 'Discover breathtaking destinations through immersive virtual tours. Explore India\'s most stunning heritage sites, waterfalls, and pilgrimage destinations.',
  keywords: ['virtual tour', 'travel', 'India', 'Andhra Pradesh', '360 tour', 'immersive travel'],
  openGraph: {
    title: 'TourItVirtually',
    description: 'Explore the world through immersive 360° virtual tours',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
