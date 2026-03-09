import { ReactNode } from "react"
import { Quicksand } from "next/font/google"

export const quickSand = Quicksand({ subsets: ["latin"], weight: ["700"] })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Ok</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        <meta name="description" content="Ok" />
      </head>
      <body className={quickSand.className}>
        <main className="min-h-screen w-full bg-main">{children}</main>
      </body>
    </html>
  )
}
