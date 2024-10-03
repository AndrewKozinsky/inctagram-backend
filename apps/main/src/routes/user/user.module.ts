import { Module } from '@nestjs/common'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtAdapterService } from '@app/jwt-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { UserController } from './user.controller'
import { DevicesRepository } from '../../repositories/devices.repository'
import { PrismaService } from '../../db/prisma.service'
import { SetAvatarToMeHandler } from '../../features/user/SetAvatarToMe.command'
import { MainConfigService } from '@app/config'
import { UserRepository } from '../../repositories/user.repository'
import { GetUserAvatarHandler } from '../../features/user/GetUserAvatar.command'
import { DeleteUserAvatarHandler } from '../../features/user/DeleteUserAvatar.command'
import { GetMyProfileHandler } from '../../features/user/GetMyProfile.command'
import { EditMyProfileHandler } from '../../features/user/EditMyProfile.command'
import { UserQueryRepository } from '../../repositories/user.queryRepository'

const services = [PrismaService, BrowserServiceService, JwtAdapterService]

const repositories = [DevicesRepository, UserRepository, UserQueryRepository]

const commandHandlers = [
	SetAvatarToMeHandler,
	GetUserAvatarHandler,
	DeleteUserAvatarHandler,
	EditMyProfileHandler,
	GetMyProfileHandler,
]

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
