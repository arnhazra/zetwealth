import { config } from "@/config"

const prefix = config.NODE_ENV

export const DbConnectionMap = {
  Auth: `${prefix}_auth`,
  Platform: `${prefix}_platform`,
  Resource: `${prefix}_resource`,
} as const

export type DbConnectionMapType =
  (typeof DbConnectionMap)[keyof typeof DbConnectionMap]
