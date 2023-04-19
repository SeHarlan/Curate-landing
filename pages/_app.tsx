import useVHOverride from '@/hooks/useVHOverride'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import { Abril_Fatface, Lato, Montserrat_Subrayada } from 'next/font/google'

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["italic", "normal"],
})

const abril = Abril_Fatface({
  subsets: ["latin"],
  weight: ["400",],
})

const montserrat = Montserrat_Subrayada({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export default function App({ Component, pageProps }: AppProps) {
  useVHOverride()
  return (
    <>
      <style jsx global>{`
        body {          
          --font-body: ${lato.style.fontFamily};
          --font-title: ${montserrat.style.fontFamily};
          --font-abril: ${abril.style.fontFamily};
        }
      `}</style>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  )
}
