import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserAnswerService } from "./user-answer.service";
import { UserAnswerController } from "./user-answer.controller";
import { UserAnswer, UserAnswerSchema } from "../schema/user-answer.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserAnswer.name, schema: UserAnswerSchema }]),
  ],
  controllers: [UserAnswerController],
  providers: [UserAnswerService],
  exports: [UserAnswerService],
})
export class UserAnswerModule {}
