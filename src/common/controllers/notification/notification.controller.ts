import { Body, Controller, Post } from '@nestjs/common';
import { DiscordNotifyService } from '../../services/discord-notify/discord-notify.service';
import { NotificationPayloadDto } from '../../dto/notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly discordNotifyService: DiscordNotifyService) {}

  @Post('/discord')
  async sendDiscordNotification(@Body() data: NotificationPayloadDto) {
    const { contents, error, type } = data;

    switch (type) {
      case 'onboarding':
        await this.discordNotifyService.onboarding(contents);
        break;

      case 'error':
        await this.discordNotifyService.crash(
          contents,
          error ? new Error(error) : new Error('Unknown error'),
        );
        break;

      case 'purchase':
        await this.discordNotifyService.purchase(contents);
        break;

      default:
        throw new Error('Invalid notification type');
    }

    return {
      message: 'Notification sent successfully',
      type,
    };
  }
}
