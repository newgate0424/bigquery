// Define additional interfaces for sa-ads compatibility
export interface AdserDataRow {
  adser: string
  adid: string
  pageid: string
  page: string
  content: string
  cookie: string
  target: string
  not_target: string
  budget: string
  note: string
  status: string
  start: string
  off: string
  captions: string
  card: string
  timezone: string
  type_time: string
  team: string
  total_card: number
  card_num: number
  total_message: number
  meta_message: number
  register: number
  deposit: number
  cost: number
  turnover: number
  total_user: number
  silent: number
  duplicate: number
  has_account: number
  spammer: number
  blocked: number
  under_18: number
  over_50: number
  foreigner: number
}

export interface TeamData {
  teamName: string
  totalDeposits: number
  totalCost: number
  cpmValue: number
  costPerDeposit: number
  dailyTarget: number
  monthlyTarget: number
  coverProgress: number
  depositsColor: string
  cpmColor: string
  costPerDepositColor: string
  coverColor: string
  adsers: string[]
  adserData: Record<string, {
    deposits: number
    cost: number
    cpm: number
    costPerDeposit: number
  }>
}

export interface AdserSummaryData {
  totalDeposits: number
  totalCost: number
  averageCpm: number
  averageCostPerDeposit: number
  teamData: TeamData[]
}

export interface AdserOverviewData {
  daily: {
    depositsData: { date: string; [key: string]: any }[]
    cpmData: { date: string; [key: string]: any }[]
    costPerDepositData: { date: string; [key: string]: any }[]
  }
}

export interface DateRange {
  from: Date | null
  to: Date | null
}