import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MainConfigModule } from '@app/config'
import { PrismaService } from '../prisma.service'

@Module({
	imports: [MainConfigModule],
	controllers: [AppController],
	providers: [AppService, PrismaService],
})
export class AppModule {}
