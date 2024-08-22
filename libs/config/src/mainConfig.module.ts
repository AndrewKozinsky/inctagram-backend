import { Module } from '@nestjs/common'
import { MainConfigService } from './mainConfigService'
import { ConfigModule } from '@nestjs/config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Make ConfigModule global in the microservices that import this library
			envFilePath: '.env', // Specify the path to your .env file
		}),
	],
	providers: [MainConfigService],
	exports: [MainConfigService],
})
export class MainConfigModule {}
