import { Module } from '@nestjs/common';
import { HashAdapterService } from './hash-adapter.service';

@Module({
  providers: [HashAdapterService],
  exports: [HashAdapterService],
})
export class HashAdapterModule {}
