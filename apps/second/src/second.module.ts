import { Module } from '@nestjs/common'
import { SecondController } from './second.controller'
import { SecondService } from './second.service'
import { ConfigModule } from '@nestjs/config'
import { MainConfigModule } from '@app/config'

@Module({
	imports: [MainConfigModule],
	controllers: [SecondController],
	providers: [SecondService],
})
export class SecondModule {}
