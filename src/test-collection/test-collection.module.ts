import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestCollection, TestCollectionSchema } from '../schema/test-collection.schema';
import { TestCollectionService } from './test-collection.service';
import { TestCollectionController } from './test-collection.controller';
import { ConfigModule } from '@nestjs/config';
import { AdminGuard } from '../guards/admin.guard';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: TestCollection.name, schema: TestCollectionSchema }]),
  ],
  controllers: [TestCollectionController],
  providers: [TestCollectionService],
  exports: [TestCollectionService, MongooseModule], 
})
export class TestCollectionModule {}
