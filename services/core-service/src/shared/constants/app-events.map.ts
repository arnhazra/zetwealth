export enum AppEventMap {
  // General Events
  GetUserDetails = "getUserDetails",
  GetSubscriptionDetails = "getSubscriptionDetails",
  ActivateTrialSubscription = "activateTrialSubscription",
  // AssetManager Events
  CreateAssetGroup = "createAssetGroup",
  GetAssetGroupList = "getAssetGroupList",
  GetTotalAsset = "getTotalAsset",
  FindAssetById = "findAssetbyId",
  UpdateAssetById = "updateAssetById",
  GetAssetList = "getAssetList",
  // DebtTrack Events
  CreateDebt = "createDebt",
  GetTotalDebt = "getTotalDebt",
  GetDebtList = "getDebtList",
  // Goal Events
  CreateGoal = "createGoal",
  GetGoalList = "getGoalList",
  GetNearestGoal = "getNearestGoal",
  // ExpenseTrack Events
  GetExpenseByMonth = "getExpenseByMonth",
  CreateExpense = "createExpense",
  //CashFlow Events
  FindCashFlowsByUserId = "findCashFlowsByUserId",
  //Calendar Events
  CreateCalendarEvent = "createCalendarEvent",
  GetCalendarEvents = "getCalendarEvents",
}
