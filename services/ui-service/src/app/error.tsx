"use client"
import { buttonVariants } from "@/shared/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"
import Link from "next/link"

export default function Error({ error }: { error?: Error }) {
  return (
    <div className="fixed inset-0 overflow-y-auto flex justify-center items-center">
      <Card className="mx-auto w-full max-w-sm bg-background border-border text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Error</CardTitle>
          <CardDescription className="text-white break-all">
            Seems like an error occured here
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/dashboard"
            className={`w-full ${cn(buttonVariants({ variant: "default", className: "bg-primary hover:bg-primary " }))} `}
          >
            Go Back
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
