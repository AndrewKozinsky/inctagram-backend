import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MainConfigModule } from '@app/config'

@Module({
	imports: [MainConfigModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
