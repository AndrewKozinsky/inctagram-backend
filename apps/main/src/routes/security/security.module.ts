import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { PrismaService } from '../../db/prisma.service'
import { MainConfigService } from '@app/config'
import { JwtAdapterService } from '@app/jwt-adapter'
import { UserRepository } from '../../repositories/user.repository'
import { UserQueryRepository } from '../../repositories/user.queryRepository'
import { SecurityController } from './security.controller'
import { SecurityRepository } from '../../repositories/security.repository'
import { SecurityQueryRepository } from '../../repositories/security.queryRepository'
import { TerminateUserDeviceHandler } from '../../features/security/TerminateUserDevice.commandHandler'
import { TerminateAllDeviceRefreshTokensApartThisHandler } from '../../features/security/TerminateAllDeviceRefreshTokensApartThis.commandHandler'

const services = [PrismaService, MainConfigService, JwtAdapterService, SecurityQueryRepository]

const repositories = [UserRepository, UserQueryRepository, SecurityRepository]

const commandHandlers = [
	TerminateUserDeviceHandler,
	TerminateAllDeviceRefreshTokensApartThisHandler,
]

@Module({
	imports: [CqrsModule],
	controllers: [SecurityController],
	providers: [...services, ...repositories, ...commandHandlers],
})
export class SecurityModule {}
