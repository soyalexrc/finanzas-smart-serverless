import { Test, TestingModule } from '@nestjs/testing';
import { DiscordNotifyService } from './discord-notify.service';

describe('DiscordNotifyService', () => {
  let service: DiscordNotifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordNotifyService],
    }).compile();

    service = module.get<DiscordNotifyService>(DiscordNotifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
