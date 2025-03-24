import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { ConfigModule } from '@nestjs/config';
import { TestCollectionModule } from 'src/test-collection/test-collection.module';
import { UserAnswerModule } from 'src/user-answer/user-answer.module';

@Module({
  providers: [BotService],
  imports: [ConfigModule, TestCollectionModule, UserAnswerModule],
  exports: [BotService],
})
export class BotModule {}
