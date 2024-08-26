import { Module } from '@nestjs/common'
import { MainConfigModule } from '@app/config'
import { AuthModule } from './routes/auth/auth.module'

@Module({
	imports: [MainConfigModule, AuthModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
