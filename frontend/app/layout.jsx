import './globals.css'
import { AuthProvider } from '../context/AuthContext'

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
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}