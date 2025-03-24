import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserAnswerDocument = UserAnswer & Document;

@Schema({ timestamps: true }) // createdAt & updatedAt qo‘shiladi
export class UserAnswer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Foydalanuvchi ID-si

  @Prop({ type: Types.ObjectId, ref: 'TestCollection', required: true })
  testCollection: Types.ObjectId; // Test to‘plami ID

  @Prop({
    type: [
      {
        question: { type: String, required: true },
        givenAnswer: { type: String, required: true },
        correctAnswer: { type: String, required: true }, // To‘g‘ri javob
        isCorrect: { type: Boolean, default: function () { return this.givenAnswer === this.correctAnswer; } },
      },
    ],
  })
  answers: {
    question: string;
    givenAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];

  @Prop({ required: true, default: 0 })
  totalScore: number; // Umumiy ball

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserAnswerSchema = SchemaFactory.createForClass(UserAnswer);
