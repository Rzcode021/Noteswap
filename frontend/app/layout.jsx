import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import Script from 'next/script'

export const metadata = {
  title: 'NoteSwap — Share Notes, Study Better',
  description: 'Access thousands of verified student notes.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* 🔥 Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-19NQ0TJM81`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-19NQ0TJM81');
          `}
        </Script>

      </head>

      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}