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
} from "@nestjs/common"
import { GoalService } from "./goal.service"
import { statusMessages } from "@/shared/constants/status-messages"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { CreateGoalRequestDto } from "./dto/request.dto"

@Controller("resource/goal")
export class GoalController {
  constructor(private readonly service: GoalService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() dto: CreateGoalRequestDto,
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
  async findAllByUserId(@Request() request: ModRequest) {
    try {
      const { userId } = request.user
      return await this.service.findAllByUserId({ userId })
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get("/:goalId")
  async findById(
    @Request() request: ModRequest,
    @Param("goalId") goalId: string
  ) {
    try {
      const { userId } = request.user
      return await this.service.findById({ userId, goalId })
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Put(":goalId")
  async updateById(
    @Body() requestBody: CreateGoalRequestDto,
    @Param("goalId") goalId: string,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.updateById(
        request.user.userId,
        goalId,
        requestBody
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Delete("/:goalId")
  async deleteById(
    @Request() request: ModRequest,
    @Param("goalId") goalId: string
  ) {
    try {
      const { userId } = request.user
      return await this.service.deleteById({ userId, goalId })
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }
}
