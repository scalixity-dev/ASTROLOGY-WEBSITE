import './globals.css'
import { Cormorant_Garamond, Open_Sans } from 'next/font/google'

import ClientLayout from './ClientLayout'

import { Header } from './components/Header'
import { Footer } from './components/Footer'
import Chatbot from './components/Chatbot'
import { PageTransition } from './components/PageTransition'
import { MysticBackground } from './components/MysticBackground'

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Nakshatra Gyaan - Your Spiritual Journey Begins Here',
  description: 'Discover your path with comprehensive Vedic astrology and spiritual guidance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${openSans.variable}`}>
      <body className="bg-nebula-indigo text-starlight-silver font-sans relative">

        <ClientLayout>
          {children}
        </ClientLayout>

        <MysticBackground />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </div>xd
        <Chatbot />

      </body>
    </html>
  )
}
