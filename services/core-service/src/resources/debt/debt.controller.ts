import {
  Controller,
  Post,
  BadRequestException,
  Get,
  Delete,
  UseGuards,
  Request,
  Param,
  Body,
  Put,
  Query,
} from "@nestjs/common"
import { DebtService } from "./debt.service"
import { statusMessages } from "@/shared/constants/status-messages"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { CreateDebtRequestDto } from "./dto/request/create-debt.request.dto"

@Controller("resource/debt")
export class DebtController {
  constructor(private readonly service: DebtService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() dto: CreateDebtRequestDto,
    @Request() request: ModRequest
  ) {
    try {
      const { userId } = request.user
      return await this.service.create({ userId, ...dto })
    } catch (error) {
      throw new BadRequestException(statusMessages.connectionError)
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAllByUserId(
    @Request() request: ModRequest,
    @Query("searchKeyword") searchKeyword?: string
  ) {
    try {
      const { userId } = request.user
      return await this.service.findAllByUserId({ userId, searchKeyword })
    } catch (error) {
      throw new BadRequestException(statusMessages.connectionError)
    }
  }

  @UseGuards(AuthGuard)
  @Get("/:debtId")
  async findById(
    @Request() request: ModRequest,
    @Param("debtId") debtId: string
  ) {
    try {
      return await this.service.findById(request.user.userId, debtId)
    } catch (error) {
      throw new BadRequestException(statusMessages.connectionError)
    }
  }

  @UseGuards(AuthGuard)
  @Put(":debtId")
  async updateById(
    @Body() requestBody: CreateDebtRequestDto,
    @Param("debtId") debtId: string,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.updateById(
        request.user.userId,
        debtId,
        requestBody
      )
    } catch (error) {
      throw new BadRequestException(statusMessages.connectionError)
    }
  }

  @UseGuards(AuthGuard)
  @Delete("/:debtId")
  async deleteById(
    @Request() request: ModRequest,
    @Param("debtId") debtId: string
  ) {
    try {
      return await this.service.deleteById(request.user.userId, debtId)
    } catch (error) {
      throw new BadRequestException(statusMessages.connectionError)
    }
  }
}
