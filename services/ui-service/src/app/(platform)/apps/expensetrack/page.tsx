"use client"
import { useUserContext } from "@/context/user.provider"
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
import { useConfirmContext } from "@/shared/providers/confirm.provider"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import * as Icons from "lucide-react"
import api from "@/shared/lib/ky-api"
import Link from "next/link"
import { addMonths, format, subMonths } from "date-fns"
import { usePlatformConfig } from "@/context/platformconfig.provider"

export default function Page() {
  const { confirm } = useConfirmContext()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [{ searchKeyword, user }] = useUserContext()
  const queryClient = useQueryClient()
  const { platformConfig } = usePlatformConfig()
  const [category, setSelectedCategory] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(
    `${format(currentDate, "yyyy-MM")}`
  )

  useEffect(() => {
    setSelectedMonth(`${format(currentDate, "yyyy-MM")}`)
  }, [currentDate])

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const expenseCategoryConfig = useQuery<ExpenseCategoryConfig>({
    queryKey: ["expense-category-config"],
    queryUrl: `${endPoints.getConfig}/expense-category-config`,
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
        notify(
          `${platformConfig?.otherConstants.resourceDeleted} expense`,
          "success"
        )
      } catch (error) {
        notify(platformConfig?.otherConstants.genericError, "error")
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
        icon={null}
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
            <Badge className="bg-border border-border text-white text-xs">
              <ExpenseCategoryIcon />
              {expenseCategory?.displayName}
            </Badge>
          </div>
        }
        actionComponents={[
          <Link
            key={expense._id}
            href={`/apps/expensetrack/createoreditexpense?id=${expense._id}`}
          >
            <Button
              className="bg-theme-800 hover:bg-theme-800 rounded-full"
              size="icon"
            >
              <Icons.Pen className="h-4 w-4 text-white" />
            </Button>
          </Link>,
          <Button
            className="bg-theme-800 hover:bg-theme-800 rounded-full"
            size="icon"
            onClick={() => deleteExpense(expense._id)}
          >
            <Icons.Trash className="h-4 w-4 text-secondary" />
          </Button>,
        ]}
      />
    )
  })

  return (
    <div className="mx-auto grid w-full items-start gap-3">
      <div className="flex gap-4">
        <Select value={category} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40 bg-theme-800 text-white border border-border rounded-lg">
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
        <div className="flex">
          <div className="flex items-center rounded-md bg-theme-800 border border-border p-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-8 w-8 text-theme-200 hover:bg-theme-800 hover:text-theme-100"
            >
              <Icons.ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-medium tracking-tight text-theme-100">
              {format(currentDate, "MMM, yyyy")}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 text-theme-200 hover:bg-theme-800 hover:text-theme-100"
            >
              <Icons.ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
        ]}
        title={`Your ${format(currentDate, "MMM, yyyy")}`}
      />
      <Show
        condition={!!expenses.data?.expenses?.length}
        fallback={
          <p className="text-center text-secondary">
            No recorded expenses to show
          </p>
        }
      >
        <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mb-4 mt-4">
          {renderExpenses}
        </div>
      </Show>
    </div>
  )
}
