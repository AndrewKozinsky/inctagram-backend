import { Module } from '@nestjs/common'
import { AppController } from './features/app.controller'
import { AppService } from './features/app.service'
import { MainConfigModule } from '@app/config'
import { PrismaService } from './prisma.service'

@Module({
	imports: [MainConfigModule],
	controllers: [AppController],
	providers: [AppService, PrismaService],
})
export class AppModule {}
