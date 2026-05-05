import { HomeIcon, Search } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useCallback } from "react"
import { useUserContext } from "@/context/user.provider"
import { searchMapByUrl, getSearchLabel } from "./data"
import Show from "../../show"
import { Button } from "../../ui/button"
import Link from "next/link"

export default function HeaderSearch() {
  const pathName = usePathname()
  const [, dispatch] = useUserContext()
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    dispatch("setSearchKeyword", "")
    return () => {}
  }, [pathName])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = window.setTimeout(() => {
        dispatch("setSearchKeyword", v)
        debounceRef.current = null
      }, 300)
    },
    [dispatch]
  )

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 w-full max-w-[17rem] sm:max-w-md md:max-w-md lg:max-w-lg -translate-x-1/2 -translate-y-1/2 px-2 sm:px-6">
      <div className="mx-auto flex items-center justify-center space-x-2 pointer-events-auto">
        <div
          className={cn(
            Object.keys(searchMapByUrl).some((path) =>
              pathName.startsWith(path)
            )
              ? ""
              : "flex justify-center"
          )}
        >
          <Link href="/dashboard">
            <Button
              variant="default"
              size="icon"
              className="bg-border hover:bg-border rounded-2xl h-10 w-10"
            >
              <HomeIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Show
          condition={Object.keys(searchMapByUrl).some((path) =>
            pathName.startsWith(path)
          )}
        >
          <div className="flex-1">
            <label htmlFor="header-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-theme-400" />
              </div>
              <Input
                name="q"
                type="search"
                placeholder={`What ${getSearchLabel(pathName) ?? ""} are you looking for?`}
                className={cn(
                  "w-full h-10 rounded-2xl bg-border hover:bg-border py-2 pl-9 pr-3 text-sm text-white placeholder:text-theme-400 focus-visible:ring-0 focus-visible:ring-main",
                  "pointer-events-auto",
                  "border-border"
                )}
                autoComplete="off"
                onChange={handleChange}
              />
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}
