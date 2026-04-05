"use client"
import { useUserContext } from "@/context/user.provider"
import Cookies from "js-cookie"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { User } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import api from "@/shared/lib/ky-api"
import { endPoints } from "@/shared/constants/api-endpoints"

export function UserNav() {
  const [{ user }] = useUserContext()

  const signOut = async () => {
    const refreshToken = Cookies.get("refreshToken")
    await api.post(endPoints.signOut, {
      json: { allDevices: false, refreshToken },
    })
    Cookies.remove("accessToken")
    Cookies.remove("refreshToken")
    window.location.replace("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-8 w-8">
          <AvatarImage src={user.avatar ?? ""} alt={user.name} />
          <AvatarFallback className="bg-theme-800">
            <User className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-background border-border text-white rounded-lg"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-theme-800" />
        <DropdownMenuGroup>
          <Link href="/account">
            <DropdownMenuItem>Account</DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
