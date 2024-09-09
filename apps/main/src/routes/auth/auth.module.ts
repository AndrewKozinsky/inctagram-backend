import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { PrismaService } from '../../db/prisma.service'
import { GitHubService } from './gitHubService'
import { MainConfigService } from '@app/config'
import { CqrsModule } from '@nestjs/cqrs'
import { CreateUserHandler } from '../../features/user/CreateUser.commandHandler'
import { UserRepository } from '../../repositories/user.repository'
import { HashAdapterService } from '@app/hash-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { JwtAdapterService } from '@app/jwt-adapter'
import { LogoutHandler } from '../../features/auth/Logout.commandHandler'
import { ConfirmEmailHandler } from '../../features/auth/ConfirmEmail.commandHandler'
import { LoginHandler } from '../../features/auth/Login.commandHandler'
import { ResendConfirmationEmailHandler } from '../../features/auth/ResendConfirmationEmail.commandHandler'
import { RecoveryPasswordHandler } from '../../features/auth/RecoveryPassword.commandHandler'
import { SetNewPasswordHandler } from '../../features/auth/SetNewPassword.commandHandler'
import { UserQueryRepository } from '../../repositories/user.queryRepository'
import { GenerateAccessAndRefreshTokensHandler } from '../../features/auth/GenerateAccessAndRefreshTokens.commandHandler'
import { GoogleService } from './googleService'
import { RegByProviderAndLoginHandler } from '../../features/user/RegByGithubAndGetTokens.commandHandler'
import { CreateRefreshTokenHandler } from '../../features/auth/CreateRefreshToken.commandHandler'
import { AuthService } from './auth.service'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { SecurityRepository } from '../../repositories/security.repository'

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

const repositories = [UserRepository, UserQueryRepository, SecurityRepository]

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
