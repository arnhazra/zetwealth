"use client"
import { useUserContext } from "@/context/user.provider"
import { EntityType } from "@/shared/components/entity-card/data"
import EntitySummarizer from "@/shared/components/entity-summarizer"
import IconContainer from "@/shared/components/icon-container"
import SectionPanel from "@/shared/components/section-panel"
import Show from "@/shared/components/show"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { endPoints } from "@/shared/constants/api-endpoints"
import { uiConstants } from "@/shared/constants/global-constants"
import HTTPMethods from "@/shared/constants/http-methods"
import {
  ExpenseResponse,
  ExpenseCategoryConfig,
} from "@/shared/constants/types"
import notify from "@/shared/hooks/use-notify"
import useQuery from "@/shared/hooks/use-query"
import { buildQueryUrl } from "@/shared/lib/build-url"
import { formatCurrency } from "@/shared/lib/format-currency"
import { formatDate } from "@/shared/lib/date-formatter"
import {
  generateMonthList,
  getCurrentMonthString,
  getNameFromMonthValue,
} from "@/shared/lib/generate-month-list"
import { useConfirmContext } from "@/shared/providers/confirm.provider"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import * as Icons from "lucide-react"
import api from "@/shared/lib/ky-api"
import Link from "next/link"

export default function Page() {
  const { confirm } = useConfirmContext()
  const [{ searchKeyword, user }] = useUserContext()
  const queryClient = useQueryClient()
  const [category, setSelectedCategory] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString())

  const expenseCategoryConfig = useQuery<ExpenseCategoryConfig>({
    queryKey: ["expense-category-config"],
    queryUrl: `${endPoints.getConfig}/expense-category-config`,
    method: HTTPMethods.GET,
  })

  const startMonth = useQuery<{ startMonth: null | string }>({
    queryKey: ["start-month"],
    queryUrl: `${endPoints.expense}/start-month`,
    method: HTTPMethods.GET,
  })

  const expenses = useQuery<ExpenseResponse>({
    queryKey: ["get-expenses", searchKeyword, selectedMonth, category],
    queryUrl: buildQueryUrl(endPoints.expense, {
      month: selectedMonth,
      searchKeyword,
      category: category === "all" ? "" : category,
    }),
    method: HTTPMethods.GET,
    suspense: !!searchKeyword ? false : true,
  })

  const totalExpense = useQuery<ExpenseResponse>({
    queryKey: ["get-total-expense", selectedMonth],
    queryUrl: buildQueryUrl(endPoints.expense, {
      month: selectedMonth,
      category: "",
    }),
    method: HTTPMethods.GET,
  })

  const deleteExpense = async (expenseId: string): Promise<void> => {
    const confirmed = await confirm({
      title: `Delete Expense`,
      desc: `Are you sure you want to delete this Expense?`,
    })

    if (confirmed) {
      try {
        await api.delete(`${endPoints.expense}/${expenseId}`)
        queryClient.refetchQueries({
          queryKey: ["get-expenses"],
        })
        notify(`${uiConstants.entityDeleted} expense`, "success")
      } catch (error) {
        notify(uiConstants.genericError, "error")
      }
    }
  }

  const renderExpenses = expenses.data?.expenses?.map((expense) => {
    const expenseCategory = expenseCategoryConfig.data?.expenseCategories.find(
      (item) => item.value === expense.expenseCategory
    )
    const ExpenseCategoryIcon =
      (Icons as any)[expenseCategory?.icon || ""] || Icons.HandCoins

    return (
      <SectionPanel
        key={expense._id}
        icon={
          <IconContainer>
            <ExpenseCategoryIcon className="h-4 w-4" />
          </IconContainer>
        }
        title={expense.title || "Untitled Expense"}
        content={
          <div className="block">
            <div className="mb-1">
              <span className="text-primary">
                {formatCurrency(expense.expenseAmount, user.baseCurrency)}{" "}
                on{" "}
              </span>

              {formatDate(expense.expenseDate, true, false)}
            </div>
            <Badge className="bg-primary text-black hover:bg-primary">
              {expenseCategory?.displayName}
            </Badge>
          </div>
        }
        actionComponents={[
          <Link
            key={expense._id}
            href={`/apps/expensetrack/createoreditexpense?id=${expense._id}`}
          >
            <Button className="bg-primary hover:bg-primary" size="icon">
              <Icons.Pen className="h-4 w-4 text-black" />
            </Button>
          </Link>,
          <Button
            className="bg-secondary hover:bg-secondary"
            size="icon"
            onClick={() => deleteExpense(expense._id)}
          >
            <Icons.Trash className="h-4 w-4" />
          </Button>,
        ]}
      />
    )
  })

  return (
    <div className="mx-auto grid w-full items-start gap-3">
      <div className="flex gap-4">
        <Select value={category} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40 bg-neutral-800 text-white border border-border rounded-lg">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-background text-white border border-border rounded-lg">
            <SelectItem key="all" value="all" className="rounded-lg">
              All Categories
            </SelectItem>
            {expenseCategoryConfig.data?.expenseCategories.map((category) => {
              return (
                <SelectItem
                  key={category.value}
                  value={category.value}
                  className="rounded-lg"
                >
                  {category.displayName}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-32 bg-neutral-800 text-white border border-border rounded-lg">
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent className="bg-background text-white border border-border rounded-lg">
            {generateMonthList(startMonth.data?.startMonth).map((month) => {
              return (
                <SelectItem key={month} value={month} className="rounded-lg">
                  {getNameFromMonthValue(month)}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <SectionPanel
        icon={
          <IconContainer>
            <Icons.LayoutDashboard className="h-4 w-4" />
          </IconContainer>
        }
        content={
          <>
            <p className="text-primary">
              Total expense:{" "}
              {formatCurrency(totalExpense.data?.total ?? 0, user.baseCurrency)}
            </p>
            <Show condition={!category || category !== "all"}>
              <p className="text-primary">
                {
                  expenseCategoryConfig.data?.expenseCategories.find(
                    (item) => item.value === category
                  )?.displayName
                }
                : {formatCurrency(expenses.data?.total ?? 0, user.baseCurrency)}
              </p>
            </Show>
          </>
        }
        actionComponents={[
          <Link href="/apps/expensetrack/createoreditexpense">
            <Button
              size="icon"
              variant="default"
              className="bg-primary hover:bg-primary"
            >
              <Icons.Plus className="h-4 w-4 text-black" />
            </Button>
          </Link>,
          <EntitySummarizer
            entityType={EntityType.EXPENSE}
            entityDetails={`${getNameFromMonthValue(selectedMonth)} - ${JSON.stringify(expenses.data)}`}
          />,
        ]}
        title={`Your ${getNameFromMonthValue(selectedMonth)}`}
      />
      <Show
        condition={!!expenses.data?.expenses?.length}
        fallback={
          <p className="text-center text-secondary">
            No recorded expenses to show
          </p>
        }
      >
        {renderExpenses}
      </Show>
    </div>
  )
}
