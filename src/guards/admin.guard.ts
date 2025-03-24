import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const userId = req.headers['telegram-id']; // Adminning Telegram ID'si kelishi kerak

    return userId === this.configService.get<string>('ADMIN_TELEGRAM_ID');
  }
}
