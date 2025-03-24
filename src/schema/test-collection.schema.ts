import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestCollectionDocument = TestCollection & Document;

@Schema()
class Question {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, enum: ['multiple-choice', 'numeric'] })
  type: 'multiple-choice' | 'numeric';

  @Prop({ type: [String], required: false })
  options?: string[];

  @Prop({ required: true })
  correctAnswer: string;
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema()
export class TestCollection {
  @Prop({ required: true })
  name: string; 

  @Prop({ required: true, enum: ['uz', 'ru'] })
  language: string; 

  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];
}

export const TestCollectionSchema = SchemaFactory.createForClass(TestCollection);
