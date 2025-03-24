import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestCollection, TestCollectionDocument } from '../schema/test-collection.schema';

@Injectable()
export class TestCollectionService {
  constructor(
    @InjectModel(TestCollection.name) private readonly testModel: Model<TestCollectionDocument>,
  ) {}

  // ✅ 1. Test qo‘shish
  async createTest(data: TestCollection): Promise<TestCollection> {
    const newTest = new this.testModel(data);
    return newTest.save();
  }

  // ✅ 2. Barcha testlarni olish
  async getAllTests(): Promise<TestCollection[]> {
    return this.testModel.find().exec();
  }

  // ✅ 3. ID bo‘yicha testni olish
  async getTestById(id: string): Promise<TestCollection | null> {
    return this.testModel.findById(id).exec();
  }

  // ✅ 4. Testni yangilash
  async updateTest(id: string, updateData: Partial<TestCollection>): Promise<TestCollection | null> {
    return this.testModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  // ✅ 5. Testni o‘chirish
  async deleteTest(id: string): Promise<TestCollection | null> {
    return this.testModel.findByIdAndDelete(id).exec();
  }

  // ✅ 6. Mavjud tillarni olish
  async getAvailableLanguages(): Promise<string[]> {
    const languages = await this.testModel.distinct('language').exec();
    return languages;
  }

  // ✅ 7. Testlarni til bo‘yicha olish
  async getTestsByLanguage(language: string): Promise<TestCollection[]> {
    return this.testModel.find({ language }).exec();
  }

  // ✅ 8. Nom va til bo‘yicha testni olish
  async getTestByNameAndLanguage(name: string, language: string): Promise<TestCollection | null> {
    return this.testModel.findOne({ name, language }).exec();
  }
}
