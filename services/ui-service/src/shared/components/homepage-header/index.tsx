"use client"
import Link from "next/link"
import { TrendingUp, PanelLeft } from "lucide-react"
import { Button, buttonVariants } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet"
import { cn } from "@/shared/lib/utils"
import IconContainer from "../icon-container"
import { PLATFORM_NAME } from "@/shared/constants/config"
import { usePlatformConfig } from "@/context/platformconfig.provider"

export default function HomePageHeader() {
  const { platformConfig } = usePlatformConfig()

  return (
    <header className="relative z-50 top-0 flex h-[64px] items-center bg-background text-white">
      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold me-8"
        >
          <IconContainer>
            <TrendingUp className="h-4 w-4" />
          </IconContainer>
          {PLATFORM_NAME}
        </Link>

        <nav className="hidden md:flex items-center justify-end gap-3 flex-1">
          {platformConfig?.homeNavigationConfig.navigationItems.map(
            (item, index) => (
              <Link
                key={index}
                href={item.link}
                className="text-sm font-bold text-theme-200 hover:text-primary mx-3"
                target={item.external ? "_blank" : ""}
                rel={item.external ? "noopener noreferrer" : ""}
              >
                {item.displayName}
              </Link>
            )
          )}
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({
                variant: "default",
                className:
                  "bg-primary hover:bg-primary text-black rounded-2xl h-9",
              })
            )}
          >
            {platformConfig?.otherConstants.getStartedButton}
          </Link>
        </nav>

        <div className="flex items-center space-x-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <PanelLeft className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="bg-background text-white border-none px-6 pt-2"
            >
              <SheetTitle></SheetTitle>

              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <IconContainer>
                    <TrendingUp className="h-4 w-4" />
                  </IconContainer>
                </Link>

                {platformConfig?.homeNavigationConfig.navigationItems.map(
                  (item, index) => (
                    <Link
                      key={index}
                      href={item.link}
                      className="text-white hover:text-primary"
                      target={item.external ? "_blank" : ""}
                      rel={item.external ? "noopener noreferrer" : ""}
                    >
                      {item.displayName}
                    </Link>
                  )
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
