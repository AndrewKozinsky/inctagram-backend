import { Module } from '@nestjs/common'
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices'
import { UserController } from './user.controller'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtAdapterService } from '@app/jwt-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { DevicesRepository } from '../../repositories/devices.repository'
import { PrismaService } from '../../db/prisma.service'
import { SetAvatarToMeHandler } from '../../features/user/SetAvatarToMe.commandHandler'
import { MainConfigService } from '@app/config'

const services = [PrismaService, BrowserServiceService, JwtAdapterService]

const repositories = [DevicesRepository]

const commandHandlers = [SetAvatarToMeHandler]

@Module({
	imports: [CqrsModule],
	controllers: [UserController],
	providers: [
		...services,
		...repositories,
		...commandHandlers,
		{
			provide: 'FILES_MICROSERVICE',
			useFactory(mainConfig: MainConfigService) {
				const { port } = mainConfig.get().filesMicroService

				return ClientProxyFactory.create({
					transport: Transport.TCP,
					options: {
						host: 'localhost',
						port: port,
					},
				})
			},
			inject: [MainConfigService],
		},
	],
})
export class UserModule {}
