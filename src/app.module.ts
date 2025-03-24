import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./schema/user.schema";
import { UserAnswerSchema } from "./schema/user-answer.schema";
import { TestCollectionSchema } from "./schema/test-collection.schema";
import { TestCollectionModule } from './test-collection/test-collection.module';
import { BotModule } from './bot/bot.module';
import { UserAnswerModule } from "./user-answer/user-answer.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    MongooseModule.forFeature([
      {
        name: "User",
        schema: UserSchema
      },
      {
        name: "UserAnswer",
        schema: UserAnswerSchema
      },
      {
        name: "TestCollection",
        schema: TestCollectionSchema
      }
    ]),
    TestCollectionModule,
    BotModule,
    UserAnswerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
