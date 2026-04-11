import { Currency } from "country-code-enum"

export enum AssetType {
  LUMPSUM_DEPOSIT = "LUMPSUM_DEPOSIT",
  RECURRING_DEPOSIT = "RECURRING_DEPOSIT",
  METAL = "METAL",
  REAL_ESTATE = "REAL_ESTATE",
  BOND = "BOND",
  LIQUID = "LIQUID",
  RETIREMENT = "RETIREMENT",
  EQUITY = "EQUITY",
  CRYPTO = "CRYPTO",
  OTHER = "OTHER",
}

export enum RecurringFrequency {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  HALF_YEARLY = "HALF_YEARLY",
  YEARLY = "YEARLY",
}

export enum FlowDirection {
  INWARD = "INWARD",
  OUTWARD = "OUTWARD",
}

export enum FlowFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export interface User {
  _id: string
  email: string
  name: string
  role: string
  baseCurrency: Currency
  avatar?: string | null
  reduceCarbonEmissions: boolean
  useCowork: boolean
  createdAt: string
}

export interface Thread {
  _id: string
  threadId: string
  userId: string
  prompt?: string | null
  response?: string | null
  createdAt: string
}

export interface AssetGroup {
  _id: string
  userId: string
  assetgroupName: string
  currentValuation?: number | null
  assetCount?: number | null
  createdAt: string
}

export interface Asset {
  _id: string // COMMON
  userId: string // COMMON
  assetgroupId: string // COMMON
  assetType: AssetType // COMMON
  assetName: string // COMMON
  identifier: string // COMMON
  currentValuation?: number | null // COMMON
  createdAt: Date // COMMON
  isMaturityApproaching: boolean // COMMON
  isMatured: boolean // COMMON
  startDate?: string // LUMPSUM_DEPOSIT, RECURRING_DEPOSIT, BOND
  maturityDate?: string // LUMPSUM_DEPOSIT, RECURRING_DEPOSIT, BOND
  amountInvested?: number // LUMPSUM_DEPOSIT, BOND
  expectedReturnRate?: number // LUMPSUM_DEPOSIT, RECURRING_DEPOSIT, BOND
  contributionAmount?: number // RECURRING_DEPOSIT
  contributionFrequency?: RecurringFrequency // RECURRING_DEPOSIT
  valuationOnPurchase?: number // REAL_ESTATE, METAL, OTHER
  units?: number // EQUITY, CRYPTO
  unitPurchasePrice?: number // EQUITY, CRYPTO
}

export interface Debt {
  _id: string
  userId: string
  debtPurpose: string
  identifier: string
  startDate: string
  endDate: string
  principalAmount: number
  interestRate: number
  createdAt: string
  emi: number
  totalRepayment: number
  totalInterest: number
  totalEmis: number
  pendingEmis: number
  paidEmis: number
  remainingPrincipal: number
  remainingTotal: number
  nextEmiDate: string
  isMaturityApproaching: boolean
  isMatured: boolean
}

export interface Goal {
  _id: string
  userId: string
  goalDate: string
  goalAmount: number
  createdAt: string
}

export interface TotalDebtDetails {
  remainingDebt: number
  totalEMI: number
  totalPrincipal: number
}

export interface Article {
  source?: {
    id?: string | null
    name?: string | null
  } | null
  author?: string | null
  title?: string | null
  description?: string | null
  url?: string | null
  urlToImage?: string | null
  publishedAt?: Date | null
  content?: string | null
}

export interface FindNewsResponse {
  status?: string | null
  totalResults?: number | null
  articles?: Article[] | null
}

export interface ExpenseCategoryConfig {
  expenseCategories: {
    displayName: string
    value: string
    icon: string
  }[]
}

export interface Expense {
  _id: string
  userId: string
  title?: string
  expenseAmount: number
  expenseCategory: string
  expenseDate: string
}

export interface ExpenseResponse {
  total?: number | null
  expenses?: Expense[] | null
}

export interface Cashflow {
  _id: string
  userId: string
  targetAsset: string
  description: string
  flowDirection: FlowDirection
  amount: number
  frequency: FlowFrequency
  nextExecutionAt: string
  createdAt: string
}

export interface CalendarEvent {
  _id: string
  userId: string
  eventName: string
  eventDate: string
  createdAt: string
  eventSource: string
}

export interface HeroConfig {
  title: string
  description: string
  getStartedUrl: string
}

export interface App {
  appName: string
  displayName: string
  description: string
  icon: string
  url: string
  enabled: boolean
}

export interface AppConfig {
  title: string
  description: string
  apps: App[]
}

export interface Feature {
  displayName: string
  description: string
  icon: string
}

export interface FeatureConfig {
  title: string
  desc: string
  features: Feature[]
}

export interface Widget {
  icon: string
  title: string
  value: string
  additionalInfo: string
}

export interface WidgetConfig {
  title: string
  desc: string
  widgets: Widget[]
}

export interface Plan {
  name: string
  price: string
  icon: string
  features: string[]
}

export interface SubscriptionConfig {
  title: string
  desc: string
  plans: Plan[]
}

export interface NavigationItem {
  displayName: string
  link: string
  external?: boolean
}

export interface HomeNavigationConfig {
  navigationItems: NavigationItem[]
}

export interface ServiceTier {
  name: string
  description: string
}

export interface ServiceTierConfig {
  title: string
  icon: string
  description: string
  learnMoreUrl: string
  learnMoreText: string
  contactUrl: string
  contactText: string
  tiers: ServiceTier[]
}

export interface ConstantConfig {
  otherConstants: Record<string, string>
}

export interface HomeConfig {
  homeNavigationConfig: HomeNavigationConfig
  heroConfig: HeroConfig
  featureConfig: FeatureConfig
  appConfig: AppConfig
  serviceTiersConfig: ServiceTierConfig
  subscriptionConfig: SubscriptionConfig
}

export interface PlatformConfig extends HomeConfig {
  otherConstants: Record<string, string>
  widgetConfig: WidgetConfig
}
