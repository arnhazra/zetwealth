import { Injectable } from "@nestjs/common"
import { AppConfigurationClient } from "@azure/app-configuration"
import { statusMessages } from "@/shared/constants/status-messages"

@Injectable()
export class ConfigService {
  private client = new AppConfigurationClient(
    process.env.AZURE_APP_CONFIG_CONNECTION_STRING
  )

  async getConfig(configName: string) {
    try {
      const setting = await this.client.getConfigurationSetting({
        key: configName,
      })

      if (!setting?.value) {
        throw new Error(statusMessages.configNotFound)
      }

      const value = setting.value

      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    } catch (error) {
      throw error
    }
  }
}
