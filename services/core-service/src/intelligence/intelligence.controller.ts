import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  BadRequestException,
  Res,
} from "@nestjs/common"
import { Response } from "express"
import { IntelligenceService } from "./intelligence.service"
import { ConversationDto } from "./dto/conversation.dto"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { statusMessages } from "@/shared/constants/status-messages"
import setSSEHeaders from "./utils/header-util"

@Controller("intelligence")
export class IntelligenceController {
  constructor(private readonly service: IntelligenceService) {}

  @UseGuards(AuthGuard)
  @Get("thread/:threadId")
  async getThreadById(
    @Request() request: ModRequest,
    @Param("threadId") threadId: string
  ) {
    try {
      return await this.service.getThreadById(threadId, false)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Post("conversation")
  async conversation(
    @Request() request: ModRequest,
    @Body() dto: ConversationDto,
    @Res() res: Response
  ) {
    setSSEHeaders(res)
    try {
      for await (const event of this.service.conversation(
        dto,
        request.user.userId
      )) {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
      res.write("data: [DONE]\n\n")
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({ type: "error", data: error.message || statusMessages.connectionError })}\n\n`
      )
    } finally {
      res.end()
    }
  }
}
