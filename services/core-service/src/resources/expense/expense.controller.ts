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
import { CreateExpenseRequestDto } from "./dto/request/request.dto"
import { ExpenseCategory } from "@/shared/constants/types"

@Controller("resource/expense")
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() dto: CreateExpenseRequestDto,
    @Request() request: ModRequest
  ) {
    try {
      const { userId } = request.user
      return await this.service.create({ userId, ...dto })
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAllByUserId(
    @Request() request: ModRequest,
    @Query("month") month?: string,
    @Query("searchKeyword") searchKeyword?: string,
    @Query("category") expenseCategory?: ExpenseCategory
  ) {
    try {
      const { userId } = request.user
      return await this.service.findAllByUserId({
        userId,
        monthFilter: month,
        expenseCategory,
        searchKeyword,
      })
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get("/:expenseId")
  async findById(
    @Request() request: ModRequest,
    @Param("expenseId") expenseId: string
  ) {
    try {
      return await this.service.findById(request.user.userId, expenseId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Put(":expenseId")
  async updateById(
    @Body() requestBody: CreateExpenseRequestDto,
    @Param("expenseId") expenseId: string,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.updateById(
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
  async deleteById(
    @Request() request: ModRequest,
    @Param("expenseId") expenseId: string
  ) {
    try {
      return await this.service.deleteById(request.user.userId, expenseId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }
}
