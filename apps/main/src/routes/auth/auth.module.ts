import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { PrismaService } from '../../db/prisma.service'
import { AuthService } from './auth.service'
import { MainConfigService } from '@app/config'
import { CqrsModule } from '@nestjs/cqrs'
import { CreateUserHandler } from '../../features/user/CreateUser.commandHandler'
import { UserRepository } from '../../repositories/user.repository'
import { HashAdapterService } from '@app/hash-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { JwtAdapterService } from '@app/jwt-adapter'
import { AuthRepository } from '../../repositories/auth.repository'
import { LogoutHandler } from '../../features/auth/Logout.commandHandler'
import { ConfirmEmailHandler } from '../../features/auth/ConfirmEmail.commandHandler'
import { LoginCommand } from '../../features/auth/Login.command'
import { LoginHandler } from '../../features/auth/Login.commandHandler'

const services = [
	AuthService,
	PrismaService,
	MainConfigService,
	HashAdapterService,
	BrowserServiceService,
	JwtAdapterService,
]

const repositories = [UserRepository, AuthRepository]

const commandHandlers = [CreateUserHandler, ConfirmEmailHandler, LoginHandler, LogoutHandler]

@Module({
	imports: [CqrsModule],
	controllers: [AuthController],
	providers: [...services, ...repositories, ...commandHandlers],
})
export class AuthModule {}
