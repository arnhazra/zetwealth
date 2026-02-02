import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Patch,
  Request,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { statusMessages } from "@/shared/constants/status-messages"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { UpdateAttributeDto } from "./dto/update-attribute.dto"
import { GoogleOAuthDto } from "./dto/google-oauth.dto"
import { blockListedAttributes } from "./utils/blocklisted-attribute"

@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post("googleoauth")
  async googleOAuth(@Body() googleOAuthDto: GoogleOAuthDto) {
    try {
      const response = await this.service.googleOAuth(googleOAuthDto)
      const { accessToken, refreshToken, success } = response

      if (success) {
        return { accessToken, refreshToken }
      } else {
        throw new BadRequestException(statusMessages.connectionError)
      }
    } catch (error) {
      throw new BadRequestException(statusMessages.connectionError)
    }
  }

  @Post("refresh")
  async refreshTokens(@Body() body: any) {
    try {
      const { refreshToken: currentRefreshToken } = body
      if (!currentRefreshToken) {
        throw new UnauthorizedException(statusMessages.refreshTokenMissing)
      }
      const response = await this.service.refreshTokens(currentRefreshToken)
      const { accessToken, refreshToken } = response
      return { accessToken, refreshToken }
    } catch (error) {
      throw error
    }
  }

  @UseGuards(AuthGuard)
  @Get("userdetails")
  async getUserDetails(@Request() request: ModRequest) {
    try {
      const { user } = await this.service.getUserDetails(request.user.userId)
      return { user }
    } catch (error) {
      throw new BadRequestException(statusMessages.invalidUser)
    }
  }

  @UseGuards(AuthGuard)
  @Post("signout")
  async signOut(
    @Body() reqBody: { allDevices: boolean; refreshToken: string },
    @Request() request: ModRequest
  ) {
    try {
      const { allDevices, refreshToken } = reqBody
      await this.service.signOut(allDevices, request.user.userId, refreshToken)
      return { message: statusMessages.signOutSuccess }
    } catch (error) {
      throw new BadRequestException(statusMessages.connectionError)
    }
  }

  @UseGuards(AuthGuard)
  @Patch("attribute")
  async updateAttribute(
    @Request() request: ModRequest,
    @Body() updateAttributeDto: UpdateAttributeDto
  ) {
    try {
      const { attributeName, attributeValue } = updateAttributeDto
      if (blockListedAttributes.includes(attributeName)) {
        throw new BadRequestException()
      }
      return await this.service.updateAttribute(
        request.user.userId,
        attributeName,
        attributeValue
      )
    } catch (error) {
      throw new BadRequestException(statusMessages.invalidUser)
    }
  }
}
