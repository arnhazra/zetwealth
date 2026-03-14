export const PLATFORM_NAME = "WallStreet"
export const GOOGLE_OAUTH_CLIENT_ID =
  "211974992845-eas8uh5t2ki6jft4tajq57ppr8skseau.apps.googleusercontent.com"

const CORE_SERVICE_URL: Partial<Record<typeof process.env.NODE_ENV, string>> = {
  production: "https://core-service-wallstreet.azurewebsites.net",
  development: "http://localhost:8080",
}

export const CORE_SERVICE_URL_BY_ENV = CORE_SERVICE_URL[process.env.NODE_ENV]
