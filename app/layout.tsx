import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { GameProvider } from "./contexts/GameContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Soccer League Management",
  description: "Manage your soccer league games and stats",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  )
}

