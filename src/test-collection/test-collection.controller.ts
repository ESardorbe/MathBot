import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { TestCollectionService } from './test-collection.service';
import { TestCollection } from '../schema/test-collection.schema';

@Controller('tests')
export class TestCollectionController {
  constructor(private readonly testService: TestCollectionService) {}

  @Post()
  createTest(@Body() data: TestCollection) {
    return this.testService.createTest(data);
  }

  @Get()
  getAllTests() {
    return this.testService.getAllTests();
  }

  @Get(':id')
  getTestById(@Param('id') id: string) {
    return this.testService.getTestById(id);
  }

  @Put(':id')
  updateTest(@Param('id') id: string, @Body() updateData: Partial<TestCollection>) {
    return this.testService.updateTest(id, updateData);
  }

  @Delete(':id')
  deleteTest(@Param('id') id: string) {
    return this.testService.deleteTest(id);
  }

  @Get('languages')
  getAvailableLanguages() {
    return this.testService.getAvailableLanguages();
  }

  @Get('language/:language')
  getTestsByLanguage(@Param('language') language: string) {
    return this.testService.getTestsByLanguage(language);
  }

  @Get('search')
  getTestByNameAndLanguage(@Body() { name, language }: { name: string; language: string }) {
    return this.testService.getTestByNameAndLanguage(name, language);
  }
}
