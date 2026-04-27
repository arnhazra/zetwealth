export const DbConnectionMap = {
  Auth: "dev_auth",
  Platform: "dev_platform",
  Intelligence: "dev_intelligence",
  Resource: "dev_resource",
} as const

export type DbConnectionMapType =
  (typeof DbConnectionMap)[keyof typeof DbConnectionMap]
