import { Injectable } from "@nestjs/common";
import { Telegraf, Context, Markup } from "telegraf";
import { ConfigService } from "@nestjs/config";
import { TestCollectionService } from "../test-collection/test-collection.service";

interface Session {
  step?: string;
  testName?: string;
  language?: string;
  questions?: {
    question: string;
    type: string;
    options?: string[];
    correctAnswer: string;
  }[];
  currentQuestionIndex?: number;
  correctAnswers?: number;
  currentTest?: any;
  tests?: any[];
  wrongAnswers?: {
    question: string;
    yourAnswer: string;
    correctAnswer: string;
  }[];
}

@Injectable()
export class BotService {
  private bot: Telegraf<Context>;
  private sessions = new Map<number, Session>();
  private adminIds: number[];

  constructor(
    private readonly configService: ConfigService,
    private readonly testCollectionService: TestCollectionService
  ) {
    const token = this.configService.get<string>("TG_TOKEN");
    if (!token) {
      throw new Error(
        "Telegram token (TG_TOKEN) is not defined in the configuration."
      );
    }

    this.adminIds = this.configService
      .get<string>("ADMIN_TELEGRAM_ID", "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id && !isNaN(Number(id)))
      .map(Number);

    this.bot = new Telegraf(token);
    this.setupBotCommands();
    this.bot.launch();
  }

  public setupBotCommands() {
    this.bot.start((ctx) => {
      ctx.reply(
        `Assalomu alaykum, ${ctx.from.first_name}! 😊\n\n📌 Matematik testlar botiga xush kelibsiz.\n\n📝 Buyruqlar:\n/tests - Test to‘plamlarini ko‘rish\n/cancel_test - Testni bekor qilish\n/addtest - Test qo‘shish\n/help - Yordam`
      );
    });

    this.bot.command("tests", async (ctx) => {
      try {
        console.log("✅ /tests buyrug'i bajarilmoqda...");
        const availableLanguages =
          await this.testCollectionService.getAvailableLanguages();
        console.log("📌 Mavjud tillar:", availableLanguages);
        if (!availableLanguages.length) {
          return ctx.reply("❌ Hozircha test mavjud emas.");
        }

        ctx.reply(
          "🌍 Iltimos, tilni tanlang:",
          Markup.keyboard(availableLanguages.map((lang) => [lang]))
            .oneTime()
            .resize()
        );
        this.sessions.set(ctx.from.id, { step: "select_language" });
      } catch (error) {
        console.error("❌ Xatolik /tests buyruqda:", error);
        ctx.reply("⚠️ Xatolik yuz berdi, iltimos qayta urinib ko‘ring.");
      }
    });

    this.bot.command("addtest", (ctx) => {
      if (!this.isAdmin(ctx.from.id)) {
        return ctx.reply("⛔ Sizda ruxsat yo‘q!");
      }
      ctx.reply("🌍 Test tili qanday bo‘lishini tanlang: UZ / RU");
      this.sessions.set(ctx.from.id, {
        step: "adding_language",
        questions: [],
      });
    });

    this.bot.command("help", (ctx) => {
      ctx.reply("Yordam buyrug‘i ishladi!");
    });

    this.bot.command("cancel_test", async (ctx) => {
      if (this.sessions.has(ctx.from.id)) {
        this.sessions.delete(ctx.from.id);

        try {
          if ("message" in (ctx.callbackQuery ?? {})) {
            await ctx.telegram.editMessageReplyMarkup(
              ctx.chat?.id,
              (ctx.callbackQuery as any)?.message?.message_id ?? 0,
              undefined,
              { inline_keyboard: [] }
            );
          }
        } catch (err) {
          console.error("Xabarni tahrirlashda xatolik:", err.message);
        }

        ctx.reply("🚫 Test bekor qilindi.", {
          reply_markup: { remove_keyboard: true },
        });
      } else {
        ctx.reply("⚠️ Siz hozir hech qanday test ishlamayapsiz.");
      }
    });

    this.bot.on("text", async (ctx) => {
      const session = this.sessions.get(ctx.from.id);
      if (!session) return;

      switch (session.step) {
        case "select_language":
          session.language = ctx.message.text.trim().toLowerCase();
          try {
            const tests = await this.testCollectionService.getTestsByLanguage(
              session.language
            );
            if (!tests.length) {
              ctx.reply("❌ Ushbu tilda testlar topilmadi.");
              return this.sessions.delete(ctx.from.id);
            }

            ctx.reply(
              "📚 Testni tanlang:",
              Markup.keyboard(tests.map((t) => [t.name]))
                .oneTime()
                .resize()
            );
            session.step = "select_test";
            session.tests = tests;
          } catch (error) {
            console.error("❌ Xatolik: getTestsByLanguage ishlamayapti", error);
            ctx.reply("⚠️ Xatolik yuz berdi, iltimos qayta urinib ko‘ring.");
          }
          break;

        case "select_test":
          const selectedTest = session.tests?.find(
            (t) =>
              t.name.toLowerCase() === ctx.message.text.trim().toLowerCase()
          );

          if (!selectedTest) {
            return ctx.reply(
              "⚠️ Noto‘g‘ri test nomi. Iltimos, mavjud testlardan birini tanlang."
            );
          }

          if (!selectedTest.questions || selectedTest.questions.length === 0) {
            return ctx.reply("❌ Ushbu testda savollar mavjud emas.");
          }

          await ctx.reply(`✅ Siz '${selectedTest.name}' testini tanladingiz.`);

          // 3, 2, 1 sanash
          for (let i = 3; i > 0; i--) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await ctx.reply(`⏳ ${i}`);
          }

          session.step = "answering_questions";
          session.currentQuestionIndex = 0;
          session.currentTest = selectedTest;
          session.correctAnswers = 0;

          this.askQuestion(ctx, session);
          break;

        case "answering_questions":
          if (
            !session.currentTest ||
            session.currentQuestionIndex === undefined
          ) {
            return ctx.reply("⚠️ Xatolik yuz berdi, testni qayta boshlang.");
          }

          const test = session.currentTest;
          const questionIndex = session.currentQuestionIndex;
          const currentQuestion = test.questions[questionIndex];

          if (
            ctx.message.text.trim().toLowerCase() !==
            currentQuestion.correctAnswer.toLowerCase()
          ) {
            session.wrongAnswers = session.wrongAnswers || [];
            session.wrongAnswers.push({
              question: currentQuestion.question,
              yourAnswer: ctx.message.text.trim(),
              correctAnswer: currentQuestion.correctAnswer,
            });
          } else {
            session.correctAnswers = (session.correctAnswers || 0) + 1;
          }

          session.currentQuestionIndex++;

          if (session.currentQuestionIndex < test.questions.length) {
            this.askQuestion(ctx, session);
          } else {
            let errorMessage = "";
            if (session.wrongAnswers && session.wrongAnswers.length > 0) {
              errorMessage =
                "❌ Xatolar:\n\n" +
                session.wrongAnswers
                  .map(
                    (item, i) =>
                      `${i + 1}. ${item.question}\n❌ Sizning javobingiz: ${item.yourAnswer}\n✅ To‘g‘ri javob: ${item.correctAnswer}\n`
                  )
                  .join("\n");
            } else {
              errorMessage =
                "🎉 Siz barcha savollarga to‘g‘ri javob berdingiz!";
            }

            ctx.reply(
              `🏁 Test tugadi! Siz ${test.questions.length} ta savoldan ${session.correctAnswers} tasiga to‘g‘ri javob berdingiz.\n\n${errorMessage}`,
              {
                reply_markup: { remove_keyboard: true },
              }
            );

            try {
              if ((ctx.callbackQuery as any)?.message) {
                ctx
                  .editMessageReplyMarkup({ inline_keyboard: [] })
                  .catch((err) => {
                    console.error("Xabarni tahrirlashda xatolik:", err.message);
                  });
              }
            } catch (error) {
              console.error(
                "❌ Xatolik: Inline tugmalarni o‘chirishda muammo!",
                error
              );
            }

            this.sessions.delete(ctx.from.id);
          }
          break;
      }

      switch (session.step) {
        case "adding_language":
          const lang = ctx.message.text.trim().toLowerCase();
          if (!["uz", "ru"].includes(lang)) {
            return ctx.reply(
              "⚠️ Noto‘g‘ri til! Faqat 'UZ' yoki 'RU' ni tanlang."
            );
          }
          session.language = lang;
          session.step = "adding_test_name";
          ctx.reply("📝 1️⃣ Testlar to‘plami nomini kiriting:");
          break;

        case "adding_test_name":
          session.testName = ctx.message.text.trim();
          session.step = "adding_questions";
          ctx.reply(
            "✏️ 2️⃣ Endi savollarni kiritishni boshlang:\n\nSavol | Variant1, Variant2, Variant3, Variant4 | To‘g‘ri javob\n\nTugatish uchun /save_test buyrug‘ini bosing."
          );
          break;

        case "adding_questions":
          if (ctx.message.text === "/save_test") {
            if (!session.questions || session.questions.length === 0) {
              return ctx.reply("❌ Kamida bitta savol kiritishingiz kerak!");
            }
            await this.testCollectionService.createTest({
              name: session.testName!,
              language: session.language!,
              questions: session.questions!.map((q) => ({
                question: q.question,
                type: q.type as "multiple-choice" | "numeric",
                options: q.options,
                correctAnswer: q.correctAnswer,
              })),
            });

            ctx.reply(`✅ Test '${session.testName}' muvaffaqiyatli saqlandi!`);
            this.sessions.delete(ctx.from.id);
          } else {
            const parts = ctx.message.text.split("|").map((p) => p.trim());
            if (parts.length !== 3) {
              return ctx.reply("⚠️ Noto‘g‘ri format! To‘g‘ri kiriting.");
            }

            const questionText = parts[0];
            const options = parts[1].split(",").map((o) => o.trim());
            const correctAnswer = parts[2];

            if (options.length !== 4) {
              return ctx.reply("⚠️ 4 ta variant kiritish shart!");
            }

            session.questions!.push({
              question: questionText,
              type: "multiple-choice",
              options,
              correctAnswer,
            });
            ctx.reply(
              "✅ Savol qo‘shildi! Yangi savol kiriting yoki /save_test buyrug‘ini bosing."
            );
          }
          break;
      }
    });
  }

  private askQuestion(ctx: Context, session: Session) {
    if (!session.currentTest || session.currentQuestionIndex === undefined) {
      return ctx.reply("⚠️ Xatolik yuz berdi, test qayta ishga tushiring.");
    }

    const question =
      session.currentTest.questions[session.currentQuestionIndex];
    if (!question) {
      return ctx.reply("⚠️ Xatolik yuz berdi, test qayta ishga tushiring.");
    }

    const questionNumber = session.currentQuestionIndex + 1;

    if (question.type === "multiple-choice") {
      ctx.reply(
        ` ${questionNumber}. ${question.question}\n\n${question.options
          ?.map((opt: string, idx: number) => `${idx + 1}. ${opt}`)
          .join("\n")}`,
        Markup.keyboard(question.options!).oneTime().resize()
      );
    } else {
      ctx.reply(` ${questionNumber}. ${question.question}`);
    }

    // console.log(`📌 ${questionNumber}-savol:`, question);
  }

  private isAdmin(userId: number): boolean {
    return this.adminIds.includes(userId);
  }
}
