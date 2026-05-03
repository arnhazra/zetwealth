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
  Put,
} from "@nestjs/common"
import { EventService } from "./event.service"
import { statusMessages } from "@/shared/constants/status-messages"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { CreateEventRequestDto } from "./dto/request/create-event.request.dto"

@Controller("resource/event")
export class EventController {
  constructor(private readonly service: EventService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() dto: CreateEventRequestDto,
    @Request() request: ModRequest
  ) {
    try {
      const { userId } = request.user
      return await this.service.create({
        userId,
        ...dto,
      })
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findMonthByUserId(
    @Request() request: ModRequest,
    @Query("month") eventMonth: string
  ) {
    try {
      const { userId } = request.user
      return await this.service.findMonthByUserId({
        userId,
        eventMonth,
      })
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get(":eventId")
  async findById(
    @Request() request: ModRequest,
    @Param("eventId") eventId: string
  ) {
    try {
      return await this.service.findById(request.user.userId, eventId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Put(":eventId")
  async updateById(
    @Request() request: ModRequest,
    @Param("eventId") eventId: string,
    @Body() dto: CreateEventRequestDto
  ) {
    try {
      return await this.service.updateById(request.user.userId, eventId, dto)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Delete("/:eventId")
  async deleteById(
    @Request() request: ModRequest,
    @Param("eventId") eventId: string
  ) {
    try {
      return await this.service.deleteById(request.user.userId, eventId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }
}
