import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Request,
  Param,
  Body,
  Put,
  BadRequestException,
  Query,
} from "@nestjs/common"
import { ExpenseService } from "./expense.service"
import { statusMessages } from "@/shared/constants/status-messages"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { CreateExpenseRequestDto } from "./dto/request/create-expense.request.dto"
import { FindMyExpensesQueryDto } from "./dto/request/find-my-expenses.request.dto"

@Controller("apps/expensetrack/expense")
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createExpense(
    @Body() requestBody: CreateExpenseRequestDto,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.createExpense(request.user.userId, requestBody)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findMyExpenses(
    @Request() request: ModRequest,
    @Query() findMyExpensesDto: FindMyExpensesQueryDto
  ) {
    try {
      const {
        category: expenseCategory,
        month: monthFilter,
        searchKeyword,
      } = findMyExpensesDto

      return await this.service.findMyExpenses(
        request.user.userId,
        monthFilter,
        searchKeyword,
        expenseCategory
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get("/:expenseId")
  async findExpenseById(
    @Request() request: ModRequest,
    @Param("expenseId") expenseId: string
  ) {
    try {
      return await this.service.findExpenseById(request.user.userId, expenseId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Put(":expenseId")
  async updateExpenseById(
    @Body() requestBody: CreateExpenseRequestDto,
    @Param("expenseId") expenseId: string,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.updateExpenseById(
        request.user.userId,
        expenseId,
        requestBody
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Delete("/:expenseId")
  async deleteExpense(
    @Request() request: ModRequest,
    @Param("expenseId") expenseId: string
  ) {
    try {
      return await this.service.deleteExpense(request.user.userId, expenseId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }
}
