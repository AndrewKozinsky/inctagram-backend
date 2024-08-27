import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { PrismaService } from '../../prisma.service'
import { AuthService } from './auth.service'
import { MainConfigService } from '@app/config'
import { CqrsModule } from '@nestjs/cqrs'
import { CreateUserHandler } from '../../features/user/CreateUser.commandHandler'
import { UserRepository } from '../../repositories/user.repository'
import { HashAdapterModule, HashAdapterService } from '@app/hash-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { JwtAdapterService } from '@app/jwt-adapter'
import { AuthRepository } from '../../repositories/auth.repository'

@Module({
	imports: [CqrsModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		PrismaService,
		MainConfigService,
		CreateUserHandler,
		HashAdapterService,
		BrowserServiceService,
		JwtAdapterService,
		UserRepository,
		AuthRepository,
	],
})
export class AuthModule {}
