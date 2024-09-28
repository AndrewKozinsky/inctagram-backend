import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { PrismaService } from '../../db/prisma.service'
import { GitHubService } from './gitHubService'
import { MainConfigService } from '@app/config'
import { CqrsModule } from '@nestjs/cqrs'
import { CreateUserHandler } from '../../features/user/CreateUser.command'
import { UserRepository } from '../../repositories/user.repository'
import { HashAdapterService } from '@app/hash-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { JwtAdapterService } from '@app/jwt-adapter'
import { LogoutHandler } from '../../features/auth/Logout.command'
import { ConfirmEmailHandler } from '../../features/auth/ConfirmEmail.command'
import { LoginHandler } from '../../features/auth/Login.command'
import { ResendConfirmationEmailHandler } from '../../features/auth/ResendConfirmationEmail.command'
import { RecoveryPasswordHandler } from '../../features/auth/RecoveryPassword.command'
import { SetNewPasswordHandler } from '../../features/auth/SetNewPassword.command'
import { UserQueryRepository } from '../../repositories/user.queryRepository'
import { GenerateAccessAndRefreshTokensHandler } from '../../features/auth/GenerateAccessAndRefreshTokens.command'
import { GoogleService } from './googleService'
import { RegByProviderAndLoginHandler } from '../../features/user/RegByGithubAndGetTokens.command'
import { CreateRefreshTokenHandler } from '../../features/auth/CreateRefreshToken.command'
import { AuthService } from './auth.service'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { DevicesRepository } from '../../repositories/devices.repository'

const services = [
	GitHubService,
	GoogleService,
	PrismaService,
	MainConfigService,
	HashAdapterService,
	BrowserServiceService,
	JwtAdapterService,
	AuthService,
	ReCaptchaAdapterService,
]

const repositories = [UserRepository, UserQueryRepository, DevicesRepository]

const commandHandlers = [
	CreateUserHandler,
	ConfirmEmailHandler,
	LoginHandler,
	LogoutHandler,
	ResendConfirmationEmailHandler,
	RecoveryPasswordHandler,
	SetNewPasswordHandler,
	GenerateAccessAndRefreshTokensHandler,
	RegByProviderAndLoginHandler,
	CreateRefreshTokenHandler,
]

@Module({
	imports: [CqrsModule],
	controllers: [AuthController],
	providers: [...services, ...repositories, ...commandHandlers],
})
export class AuthModule {}
