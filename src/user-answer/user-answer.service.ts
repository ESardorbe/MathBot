import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserAnswer, UserAnswerDocument } from "../schema/user-answer.schema";

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectModel(UserAnswer.name) private readonly userAnswerModel: Model<UserAnswerDocument>
  ) {}

  // ✅ Foydalanuvchi javobini saqlash
  async saveAnswer(userId: number, testId: string, userAnswer: string, correctAnswer: string) {
    const isCorrect = userAnswer === correctAnswer;
    const answer = new this.userAnswerModel({
      userId,
      testId,
      userAnswer,
      correctAnswer,
      isCorrect,
      createdAt: new Date(),
    });

    return answer.save();
  }

  // ✅ Foydalanuvchining barcha javoblarini olish
  async getUserAnswers(userId: number) {
    return this.userAnswerModel.find({ userId }).exec();
  }

  // ✅ Ma'lum bir test bo‘yicha foydalanuvchining javoblarini olish
  async getUserAnswersByTest(userId: number, testId: string) {
    return this.userAnswerModel.find({ userId, testId }).exec();
  }
}
