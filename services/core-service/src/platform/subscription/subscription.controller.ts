import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  Body,
} from "@nestjs/common"
import { SubscriptionService } from "./subscription.service"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { statusMessages } from "@/shared/constants/status-messages"

@Controller("platform/subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(AuthGuard)
  @Post("checkout")
  async createCheckoutSession(@Request() request: ModRequest) {
    try {
      const session = await this.subscriptionService.createCheckoutSession(
        request.user.userId
      )
      return { redirectUrl: session.url }
    } catch (error) {
      throw new BadRequestException(statusMessages.connectionError)
    }
  }

  @UseGuards(AuthGuard)
  @Get("subscribe")
  async handleSubscribe(
    @Query("sub_session_id") sessionId: string,
    @Request() request: ModRequest
  ) {
    if (!sessionId) {
      throw new BadRequestException(statusMessages.subscriptionFailure)
    } else {
      try {
        return await this.subscriptionService.handleSubscribe(
          sessionId,
          request.user.userId
        )
      } catch (error) {
        throw new BadRequestException(statusMessages.subscriptionFailure)
      }
    }
  }
}
