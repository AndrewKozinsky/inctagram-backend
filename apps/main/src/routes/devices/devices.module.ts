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
import { TerminateUserDeviceHandler } from '../../features/security/TerminateUserDevice.command'
import { TerminateAllDeviceRefreshTokensApartThisHandler } from '../../features/security/TerminateAllDeviceRefreshTokensApartThis.command'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'

const services = [PrismaService, MainConfigService, JwtAdapterService, DevicesQueryRepository]

const repositories = [UserRepository, UserQueryRepository, DevicesRepository]

const commandHandlers = [
	TerminateUserDeviceHandler,
	TerminateAllDeviceRefreshTokensApartThisHandler,
]

@Module({
	imports: [CqrsModule],
	controllers: [DevicesController],
	providers: [
		...services,
		...repositories,
		...commandHandlers,
		{
			provide: 'FILES_MICROSERVICE',
			useFactory(mainConfig: MainConfigService) {
				const { port } = mainConfig.get().filesMicroService
				const host =
					mainConfig.get().mode === 'TEST'
						? 'localhost'
						: 'inctagram-backend-files-service'

				return ClientProxyFactory.create({
					transport: Transport.TCP,
					options: {
						host,
						port,
					},
				})
			},
			inject: [MainConfigService],
		},
	],
})
export class DevicesModule {}
