import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Request,
  Param,
  Body,
  BadRequestException,
  Query,
} from "@nestjs/common"
import { CashFlowService } from "./cashflow.service"
import { statusMessages } from "@/shared/constants/status-messages"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { CreateCashFlowRequestDto } from "./dto/request/create-cashflow.request.dto"

@Controller("apps/cashflow")
export class CashFlowController {
  constructor(private readonly service: CashFlowService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() requestBody: CreateCashFlowRequestDto,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.create(request.user.userId, requestBody)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findMyCashflows(
    @Request() request: ModRequest,
    @Query("searchKeyword") searchKeyword?: string
  ) {
    try {
      return await this.service.findMyCashflows(
        request.user.userId,
        searchKeyword
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Delete("/:cashflowId")
  async delete(
    @Request() request: ModRequest,
    @Param("cashflowId") cashflowId: string
  ) {
    try {
      return await this.service.delete(request.user.userId, cashflowId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get(":cashflowId")
  async findById(
    @Request() request: ModRequest,
    @Param("cashflowId") cashflowId: string
  ) {
    try {
      return await this.service.findById(request.user.userId, cashflowId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Post(":cashflowId")
  async updateById(
    @Request() request: ModRequest,
    @Param("cashflowId") cashflowId: string,
    @Body() dto: CreateCashFlowRequestDto
  ) {
    try {
      return await this.service.updateById(request.user.userId, cashflowId, dto)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @Post("execute")
  async executeCashFlows() {
    try {
      return await this.service.executeCashFlows()
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }
}
