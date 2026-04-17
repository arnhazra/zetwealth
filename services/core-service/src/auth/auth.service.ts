import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { config } from "@/config"
import { statusMessages } from "@/shared/constants/status-messages"
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { AppEventMap } from "@/shared/constants/app-events.map"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { FindUserByEmailQuery } from "./queries/impl/find-user-by-email.query"
import { User } from "./schemas/user.schema"
import { FindUserByIdQuery } from "./queries/impl/find-user-by-id.query"
import { CreateUserCommand } from "./commands/impl/create-user.command"
import { UpdateAttributeCommand } from "./commands/impl/update-attribute.command"
import { Token } from "./schemas/token.schema"
import { GoogleOAuthDto } from "./dto/google-oauth.dto"
import { SetTokenDto } from "./dto/set-token.dto"
import { GetTokenDto } from "./dto/get-token.dto"
import { DeleteTokenDto } from "./dto/delete-token.dto"
import { SetTokenCommand } from "./commands/impl/set-token.command"
import { GetTokensQuery } from "./queries/impl/get-tokens.query"
import { DeleteTokenCommand } from "./commands/impl/delete-token.command"
import { generateToken, TokenType, verifyToken } from "@/auth/utils/jwt.util"
import { Currency } from "country-code-enum"
import * as jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"
import { Subscription } from "@/platform/subscription/schemas/subscription.schema"

@Injectable()
export class AuthService {
  private readonly googleOAuthClient: OAuth2Client

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.googleOAuthClient = new OAuth2Client(
      config.GOOGLE_OAUTH_CLIENT_ID,
      config.GOOGLE_OAUTH_CLIENT_SECRET,
      config.GOOGLE_OAUTH_REDIRECT_URI
    )
  }

  async userRegistrationOrLogin(email: string, name: string) {
    try {
      const user = await this.queryBus.execute<FindUserByEmailQuery, User>(
        new FindUserByEmailQuery(email)
      )

      if (user) {
        const tokenPayload = {
          id: String(user._id),
          email: user.email,
          iss: config.UI_URL,
        }
        const accessToken = generateToken(tokenPayload, TokenType.AccessToken)
        const refreshToken = generateToken(tokenPayload, TokenType.RefreshToken)
        await this.setRefreshToken({
          userId: String(user._id),
          token: refreshToken,
        })
        return { accessToken, refreshToken, user, success: true }
      } else {
        const newUser = await this.commandBus.execute<CreateUserCommand, User>(
          new CreateUserCommand(email, name)
        )
        await this.eventEmitter.emitAsync(
          AppEventMap.ActivateTrialSubscription,
          String(newUser._id)
        )

        const tokenPayload = {
          id: String(newUser._id),
          email: newUser.email,
          iss: config.UI_URL,
        }
        const accessToken = generateToken(tokenPayload, TokenType.AccessToken)
        const refreshToken = generateToken(tokenPayload, TokenType.RefreshToken)
        await this.setRefreshToken({
          userId: String(newUser._id),
          token: refreshToken,
        })
        return { accessToken, refreshToken, user: newUser, success: true }
      }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async googleOAuth(googleOAuthDto: GoogleOAuthDto) {
    try {
      const { tokens } = await this.googleOAuthClient.getToken(
        googleOAuthDto.code
      )

      if (!tokens.id_token)
        throw new BadRequestException("No ID token received")

      const ticket = await this.googleOAuthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.GOOGLE_OAUTH_CLIENT_ID,
      })

      const payload = ticket.getPayload()

      if (!payload?.email_verified || !payload?.email) {
        throw new BadRequestException("Email not verified")
      }

      const resp = await this.userRegistrationOrLogin(
        payload.email,
        payload.name
      )

      await this.updateAttribute(
        resp.user._id.toString(),
        "avatar",
        payload.picture
      )

      return resp
    } catch (error) {
      throw new BadRequestException("Google authentication failed")
    }
  }

  async refreshTokens(currentRefreshToken: string) {
    try {
      const decodedRefreshToken = verifyToken(
        currentRefreshToken,
        TokenType.RefreshToken
      )
      const userId = decodedRefreshToken.id
      const refreshTokens = await this.getRefreshTokens({ userId })
      const matchRefreshToken = refreshTokens.find(
        (tk) => tk.token === currentRefreshToken
      )

      if (!matchRefreshToken) {
        throw new UnauthorizedException(statusMessages.refreshTokenInvalid)
      }

      const userDetails = await this.getUserDetails(userId)

      const tokenPayload = {
        id: String(userDetails.user._id),
        email: userDetails.user.email,
        iss: config.UI_URL,
      }

      const accessToken = generateToken(tokenPayload, TokenType.AccessToken)
      const refreshToken = generateToken(tokenPayload, TokenType.RefreshToken)
      await this.deleteRefreshToken({ userId, token: currentRefreshToken })
      await this.setRefreshToken({
        userId: String(userDetails.user._id),
        token: refreshToken,
      })
      return { accessToken, refreshToken }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(statusMessages.refreshTokenExpired)
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(statusMessages.refreshTokenInvalid)
      }

      throw new UnauthorizedException(statusMessages.unauthorized)
    }
  }

  async getUserDetails(userId: string) {
    try {
      const user = await this.queryBus.execute<FindUserByIdQuery, User>(
        new FindUserByIdQuery(userId)
      )

      if (user) {
        const subscriptionRes: Subscription[] =
          await this.eventEmitter.emitAsync(
            AppEventMap.GetSubscriptionDetails,
            userId
          )

        let subscription: Subscription | null

        if (!subscriptionRes || !subscriptionRes.length) {
          subscription = null
        } else {
          subscription = subscriptionRes.shift()
        }

        return { user, subscription }
      } else {
        throw new Error(statusMessages.invalidUser)
      }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async signOut(allDevices: boolean, userId: string, refreshToken: string) {
    try {
      if (allDevices) {
        await this.deleteRefreshToken({ userId, token: null })
      } else {
        await this.deleteRefreshToken({ userId, token: refreshToken })
      }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async updateAttribute<K extends keyof User>(
    userId: string,
    attributeName: K,
    attributeValue: string | number | boolean | null | Currency
  ) {
    try {
      await this.commandBus.execute<UpdateAttributeCommand, User>(
        new UpdateAttributeCommand(userId, attributeName, attributeValue)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @OnEvent(AppEventMap.GetUserDetails)
  async findUser(userId: string): Promise<User | null> {
    try {
      return await this.queryBus.execute<FindUserByIdQuery, User>(
        new FindUserByIdQuery(userId)
      )
    } catch (error) {
      return null
    }
  }

  async setRefreshToken(setTokenDto: SetTokenDto) {
    try {
      const { userId, token } = setTokenDto
      return await this.commandBus.execute(new SetTokenCommand(userId, token))
    } catch (error) {
      throw new Error()
    }
  }

  async getRefreshTokens(getTokenDto: GetTokenDto) {
    try {
      const { userId } = getTokenDto
      return await this.queryBus.execute<GetTokensQuery, Token[]>(
        new GetTokensQuery(userId)
      )
    } catch (error) {
      throw new Error()
    }
  }

  async deleteRefreshToken(deleteTokenDto: DeleteTokenDto) {
    try {
      const { userId, token } = deleteTokenDto
      return await this.commandBus.execute(
        new DeleteTokenCommand(userId, token)
      )
    } catch (error) {
      throw new Error()
    }
  }
}
