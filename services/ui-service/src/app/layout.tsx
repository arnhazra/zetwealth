import { ReactNode } from "react"
import { Quicksand } from "next/font/google"
import Providers from "@/shared/providers"
import NextTopLoader from "nextjs-toploader"
import "../shared/styles/globals.css"
import { colorVars } from "@/shared/styles/color-vars"
import { PLATFORM_NAME } from "@/shared/constants/config"

export const quickSand = Quicksand({ subsets: ["latin"], weight: ["700"] })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>{PLATFORM_NAME}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        <meta name="theme-color" content={colorVars.main} />
        <meta name="description" content={PLATFORM_NAME} />
      </head>
      <body className={quickSand.className}>
        <Providers>
          <NextTopLoader
            color={colorVars.primary}
            showSpinner={false}
            height={2}
          />
          <main className="min-h-screen w-full bg-main">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
