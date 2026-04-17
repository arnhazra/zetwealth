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
import { ChatDto } from "./dto/chat.dto"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { statusMessages } from "@/shared/constants/status-messages"

@Controller("platform/intelligence")
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
  @Post("chat")
  async chat(
    @Request() request: ModRequest,
    @Body() chatDto: ChatDto,
    @Res() res: Response
  ) {
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.flushHeaders()

    try {
      for await (const event of this.service.chatStream(
        chatDto,
        request.user.userId
      )) {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }

      res.write("data: [DONE]\n\n")
      res.end()
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({ type: "error", data: error.message || statusMessages.connectionError })}\n\n`
      )
      res.end()
    }
  }
}
