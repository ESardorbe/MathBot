import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  telegramId: string; // Telegram ID

  @Prop({ required: true })
  username: string; // Telegram username

  @Prop({ required: true, enum: ['uz', 'ru'] })
  language: string; // Foydalanuvchi tili
}

export const UserSchema = SchemaFactory.createForClass(User);
