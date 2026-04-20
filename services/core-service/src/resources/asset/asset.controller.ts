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
import { AssetService } from "./asset.service"
import { statusMessages } from "@/shared/constants/status-messages"
import { AuthGuard, ModRequest } from "@/auth/auth.guard"
import { CreateAssetRequestDto } from "./dto/request/create-asset.request.dto"
import { CreateAssetGroupRequestDto } from "./dto/request/create-assetgroup.request.dto"

@Controller("resource/asset")
export class AssetController {
  constructor(private readonly service: AssetService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createAsset(
    @Body() requestBody: CreateAssetRequestDto,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.createAsset(request.user.userId, requestBody)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get("assetgroup/:assetgroupId")
  async findMyAssetsByAssetGroupId(
    @Request() request: ModRequest,
    @Param("assetgroupId") assetgroupId: string,
    @Query("searchKeyword") searchKeyword?: string
  ) {
    try {
      return await this.service.findMyAssetsByAssetGroupId(
        request.user.userId,
        assetgroupId,
        searchKeyword
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Post("findassetsbytype")
  async findAssetsByType(
    @Request() request: ModRequest,
    @Body("assetTypes") assetTypes: string[]
  ) {
    try {
      return await this.service.findAssetsByTypes(
        request.user.userId,
        assetTypes
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get("/:assetId")
  async findAssetById(
    @Request() request: ModRequest,
    @Param("assetId") assetId: string
  ) {
    try {
      return await this.service.findAssetById(request.user.userId, assetId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Put(":assetId")
  async updateAssetById(
    @Body() requestBody: CreateAssetRequestDto,
    @Param("assetId") assetId: string,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.updateAssetById(
        request.user.userId,
        assetId,
        requestBody
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Delete("/:assetId")
  async deleteAsset(
    @Request() request: ModRequest,
    @Param("assetId") assetId: string
  ) {
    try {
      return await this.service.deleteAsset(request.user.userId, assetId)
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }
}

@Controller("resource/assetgroup")
export class AssetGroupController {
  constructor(private readonly service: AssetService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createAssetGroup(
    @Body() requestBody: CreateAssetGroupRequestDto,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.createAssetGroup(
        request.user.userId,
        requestBody
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findMyAssetGroups(
    @Request() request: ModRequest,
    @Query("searchKeyword") searchKeyword?: string
  ) {
    try {
      return await this.service.findMyAssetGroups(
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
  @Get("/:assetgroupId")
  async findAssetGroupById(
    @Request() request: ModRequest,
    @Param("assetgroupId") assetgroupId: string
  ) {
    try {
      const assetgroup = await this.service.findAssetGroupById(
        request.user.userId,
        assetgroupId
      )
      if (!assetgroup) throw new Error()
      return assetgroup
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Put(":assetgroupId")
  async updateAssetGroupById(
    @Body() requestBody: CreateAssetGroupRequestDto,
    @Param("assetgroupId") assetgroupId: string,
    @Request() request: ModRequest
  ) {
    try {
      return await this.service.updateAssetGroupById(
        request.user.userId,
        assetgroupId,
        requestBody
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }

  @UseGuards(AuthGuard)
  @Delete("/:assetgroupId")
  async deleteAssetGroup(
    @Request() request: ModRequest,
    @Param("assetgroupId") assetgroupId: string
  ) {
    try {
      return await this.service.deleteAssetGroup(
        request.user.userId,
        assetgroupId
      )
    } catch (error) {
      throw new BadRequestException(
        error.message || statusMessages.connectionError
      )
    }
  }
}
