export const CreateCashflowSkill = `
  Create a new cashflow record for a user.

  BEFORE calling this tool:
  - Call list_eligible_assets to fetch assets available for cashflow
  - Present the asset list to the user and let them choose
  - Use the chosen asset's ID as the targetAsset field

  RULES:
  - Never fabricate or assume a targetAsset ID
  - nextExecutionAt must always be a future date, never today or past
  - amount must be a positive number
`

export const DeleteCashflowSkill = `
  Delete an existing cashflow record for a user.

  BEFORE calling this tool:
  - Check if list_cashflows exists in Available Tools
  - If yes → call list_cashflows first to retrieve available cashflows
  - Present the list to the user and let them choose which one to delete
  - Use the chosen cashflow's ID as the _id field

  RULES:
  - Never fabricate or assume a cashflow ID
  - Always confirm with the user before proceeding with deletion
  - If list_cashflows is not available → ask the user to provide the cashflow ID directly
`
