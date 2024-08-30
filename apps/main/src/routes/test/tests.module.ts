import { Module } from '@nestjs/common'
import { DbService } from '../../db/dbService'
import { TestsController } from './tests.controller'
import { PrismaService } from '../../db/prisma.service'

@Module({
	imports: [],
	controllers: [TestsController],
	providers: [DbService, PrismaService],
})
export class TestsModule {}
