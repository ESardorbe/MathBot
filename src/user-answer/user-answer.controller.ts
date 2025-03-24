import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { UserAnswerService } from "./user-answer.service";

@Controller("user-answers")
export class UserAnswerController {
  constructor(private readonly userAnswerService: UserAnswerService) {}

  // ✅ Foydalanuvchining barcha javoblarini olish
  @Get(":userId")
  async getUserAnswers(@Param("userId") userId: number) {
    return this.userAnswerService.getUserAnswers(userId);
  }

  // ✅ Ma'lum bir test bo‘yicha foydalanuvchining javoblarini olish
  @Get(":userId/:testId")
  async getUserAnswersByTest(@Param("userId") userId: number, @Param("testId") testId: string) {
    return this.userAnswerService.getUserAnswersByTest(userId, testId);
  }

  // ✅ Javobni saqlash
  @Post()
  async saveAnswer(
    @Body() body: { userId: number; testId: string; userAnswer: string; correctAnswer: string }
  ) {
    return this.userAnswerService.saveAnswer(
      body.userId,
      body.testId,
      body.userAnswer,
      body.correctAnswer
    );
  }
}
