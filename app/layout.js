import './globals.css'

export const metadata = {
  title: 'Doctoral Dashboard',
  description: 'Your research cockpit for doctoral work',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
