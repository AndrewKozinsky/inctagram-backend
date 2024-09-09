import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { PrismaService } from '../../db/prisma.service'
import { MainConfigService } from '@app/config'
import { JwtAdapterService } from '@app/jwt-adapter'
import { UserRepository } from '../../repositories/user.repository'
import { UserQueryRepository } from '../../repositories/user.queryRepository'
import { DevicesController } from './devices.controller'
import { DevicesRepository } from '../../repositories/devices.repository'
import { DevicesQueryRepository } from '../../repositories/devices.queryRepository'
import { TerminateUserDeviceHandler } from '../../features/security/TerminateUserDevice.commandHandler'
import { TerminateAllDeviceRefreshTokensApartThisHandler } from '../../features/security/TerminateAllDeviceRefreshTokensApartThis.commandHandler'

const services = [PrismaService, MainConfigService, JwtAdapterService, DevicesQueryRepository]

const repositories = [UserRepository, UserQueryRepository, DevicesRepository]

const commandHandlers = [
	TerminateUserDeviceHandler,
	TerminateAllDeviceRefreshTokensApartThisHandler,
]

@Module({
	imports: [CqrsModule],
	controllers: [DevicesController],
	providers: [...services, ...repositories, ...commandHandlers],
})
export class DevicesModule {}
