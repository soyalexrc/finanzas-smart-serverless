import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { NotificationContentDto } from '../../dto/notification.dto';
import { firstValueFrom } from 'rxjs';

type WebhookType = 'error' | 'onboarding' | 'purchase';

@Injectable()
export class DiscordNotifyService {
  private readonly logger = new Logger(DiscordNotifyService.name);

  private readonly webhookUrl: Record<WebhookType, string>;

  constructor(private readonly http: HttpService) {
    this.webhookUrl = {
      onboarding: process.env.ONBOARDING_DISCORD_WEBHOOK_URL || '',
      purchases: process.env.PURCHASES_DISCORD_WEBHOOK_URL || '',
      error: process.env.ERROR_DISCORD_WEBHOOK_URL || '',
    };
  }

  private async sendEmbed(embed: any, type: WebhookType): Promise<void> {
    const url = this.webhookUrl[type];

    if (!url) {
      this.logger.warn(`No webhook URL set for type: ${type}`);
      return;
    }

    try {
      await firstValueFrom(this.http.post(url, { embeds: [embed] }));
      this.logger.log(`✅ Discord notification sent to ${type}`);
    } catch (err) {
      this.logger.error(
        `❌ Failed to send Discord notification for ${type}`,
        err,
      );
    }
  }

  async onboarding(contents: NotificationContentDto[]) {
    await this.sendEmbed(
      {
        title: '🎉 New User Registration',
        description: `A new user has signed up!`,
        fields: contents,
        timestamp: new Date().toISOString(),
        color: 0x00ff00,
      },
      'onboarding',
    );
  }

  async purchase(contents: NotificationContentDto[]) {
    await this.sendEmbed(
      {
        title: '💳 New Purchase',
        description: `A user has completed a purchase!`,
        fields: contents,
        timestamp: new Date().toISOString(),
        color: 0x00aaff,
      },
      'purchases',
    );
  }

  async crash(contents: NotificationContentDto[], error?: Error) {
    await this.sendEmbed(
      {
        title: '💥 Crash Report',
        description: `An error occurred:\n\`\`\`ts\n${error?.message ?? 'Unknown error'}\n\`\`\``,
        fields: contents,
        timestamp: new Date().toISOString(),
        color: 0xff0000,
      },
      'error',
    );
  }
}
