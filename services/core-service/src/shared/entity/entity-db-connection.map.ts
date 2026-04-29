export const DbConnectionMap = {
  Auth: "auth",
  Platform: "platform",
  Intelligence: "intelligence",
  Resource: "resource",
} as const

export type DbConnectionMapType =
  (typeof DbConnectionMap)[keyof typeof DbConnectionMap]
