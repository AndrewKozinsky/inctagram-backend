import { Module } from '@nestjs/common'
import { MainConfigService } from './mainConfigService'
import { ConfigModule } from '@nestjs/config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Make ConfigModule global in the microservices that import this library
			ignoreEnvFile:
				process.env.NODE_ENV !== 'DEVELOPMENT' && process.env.NODE_ENV !== 'TEST',
			envFilePath: ['.env.test', '.env'],
		}),
	],
	providers: [MainConfigService],
	exports: [MainConfigService],
})
export class MainConfigModule {}
