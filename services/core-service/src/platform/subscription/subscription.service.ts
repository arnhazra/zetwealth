import Stripe from "stripe"
import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { config } from "@/config"
import { OnEvent } from "@nestjs/event-emitter"
import { AppEventMap } from "@/shared/constants/app-events.map"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { CreateSubscriptionCommand } from "./commands/impl/create-subscription.command"
import { FindSubscriptionByUserIdQuery } from "./queries/impl/find-subscription-by-user-id.query"
import { Subscription } from "./schemas/subscription.schema"
import { CreateBlockListedSessionCommand } from "./commands/impl/create-blocklisted-session.command"
import { FindBlockListedSessionByIdQuery } from "./queries/impl/find-blocklisted-session.query"
import { BlockListedSession } from "./schemas/blocklisted-session.schema"
import { ConfigService } from "../config/config.service"

@Injectable()
export class SubscriptionService {
  private readonly stripe = new Stripe(config.STRIPE_SECRET_KEY)

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService
  ) {}

  async createCheckoutSession(userId: string): Promise<{ url: string | null }> {
    try {
      const homeConfig = await this.configService.getConfig("home-config")
      const subscriptionPrice = Number(homeConfig.subscriptionConfig.price)

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${config.PLATFORM_NAME} Subscription`,
              },
              unit_amount: subscriptionPrice * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${config.UI_URL}/dashboard?sub_session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.UI_URL}/dashboard?sub_session_id=null`,
        metadata: {
          userId,
          price: String(subscriptionPrice),
        },
      })

      return { url: session.url }
    } catch (error) {
      throw new Error()
    }
  }

  async handleSubscribe(sessionId: string, userId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId)
      const metadata = session.metadata ?? {}
      const price = metadata.price

      if (!userId || !price) {
        throw new Error()
      }

      const blocklistedSessionData = await this.queryBus.execute<
        FindBlockListedSessionByIdQuery,
        BlockListedSession
      >(new FindBlockListedSessionByIdQuery(sessionId))

      if (!!blocklistedSessionData || metadata.userId !== userId) {
        throw new Error()
      }

      await this.commandBus.execute(
        new CreateSubscriptionCommand(userId, Number(price))
      )

      await this.commandBus.execute(
        new CreateBlockListedSessionCommand(sessionId)
      )
      return { success: true }
    } catch (error) {
      throw new Error()
    }
  }

  async activateTrial(userId: string) {
    try {
      await this.commandBus.execute(new CreateSubscriptionCommand(userId, 0))
      return { success: true }
    } catch (error) {
      throw new Error()
    }
  }

  @OnEvent(AppEventMap.GetSubscriptionDetails)
  async getMySubscription(userId: string) {
    try {
      const subscription: Subscription | null | undefined =
        await this.queryBus.execute(new FindSubscriptionByUserIdQuery(userId))

      if (!subscription) {
        return null
      }

      const { endsAt } = subscription
      const isActive = subscription && new Date(endsAt) > new Date()
      const subscriptionData =
        typeof (subscription as any).toObject === "function"
          ? (subscription as any).toObject()
          : ((subscription as any)._doc ?? subscription)

      return {
        ...subscriptionData,
        isActive,
      }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }
}
