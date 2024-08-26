import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { PrismaService } from '../../prisma.service'
import { AuthService } from './auth.service'
import { MainConfigService } from '@app/config'

@Module({
	imports: [],
	controllers: [AuthController],
	providers: [AuthService, PrismaService, MainConfigService],
})
export class AuthModule {}
