const fallbackColor = "#de7356"

const cssVar = (variable: string): string => {
  if (typeof document !== "undefined") {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim()
    if (value) return value
  }
  return fallbackColor
}

export const colorVars = {
  get main() {
    return cssVar("--color-main")
  },
  get background() {
    return cssVar("--color-background")
  },
  get border() {
    return cssVar("--color-border")
  },
  get primary() {
    return cssVar("--color-primary")
  },
  get secondary() {
    return cssVar("--color-secondary")
  },
}
