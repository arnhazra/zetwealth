import { CORE_SERVICE_URL_BY_ENV } from "./config"

export const endPoints = {
  // Auth Service
  googleOAuthLogin: `${CORE_SERVICE_URL_BY_ENV}/auth/googleoauth`,
  userDetails: `${CORE_SERVICE_URL_BY_ENV}/auth/userdetails`,
  refresh: `${CORE_SERVICE_URL_BY_ENV}/auth/refresh`,
  signOut: `${CORE_SERVICE_URL_BY_ENV}/auth/signout`,
  updateAttribute: `${CORE_SERVICE_URL_BY_ENV}/auth/attribute`,
  // Platform Service
  getConfig: `${CORE_SERVICE_URL_BY_ENV}/platform/config`,
  intelligence: `${CORE_SERVICE_URL_BY_ENV}/platform/intelligence`,
  widgets: `${CORE_SERVICE_URL_BY_ENV}/platform/widgets`,
  // Apps Service
  assetgroup: `${CORE_SERVICE_URL_BY_ENV}/apps/assetmanager/assetgroup`,
  asset: `${CORE_SERVICE_URL_BY_ENV}/apps/assetmanager/asset`,
  debt: `${CORE_SERVICE_URL_BY_ENV}/apps/debttrack/debt`,
  goal: `${CORE_SERVICE_URL_BY_ENV}/apps/goal`,
  news: `${CORE_SERVICE_URL_BY_ENV}/apps/discover/news`,
  expense: `${CORE_SERVICE_URL_BY_ENV}/apps/expensetrack/expense`,
  taxAdvisor: `${CORE_SERVICE_URL_BY_ENV}/apps/taxadvisor`,
  cashflow: `${CORE_SERVICE_URL_BY_ENV}/apps/cashflow`,
  events: `${CORE_SERVICE_URL_BY_ENV}/apps/calendar/event`,
}
