import { Module } from '@nestjs/common'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtAdapterService } from '@app/jwt-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { MainConfigService } from '@app/config'
import { UserController } from './user.controller'
import { DevicesRepository } from '../../repositories/devices.repository'
import { PrismaService } from '../../db/prisma.service'
import { SetAvatarToMeHandler } from '../../features/user/SetAvatarToMe.command'
import { UserRepository } from '../../repositories/user.repository'
import { GetUserAvatarHandler } from '../../features/user/GetUserAvatar.query'
import { DeleteUserAvatarHandler } from '../../features/user/DeleteUserAvatar.command'
import { GetMyProfileHandler } from '../../features/user/GetMyProfile.query'
import { EditMyProfileHandler } from '../../features/user/EditMyProfile.command'
import { UserQueryRepository } from '../../repositories/user.queryRepository'
// import { GetUserPostsHandler } from '../../features/posts/GetUserPosts.query'
import { PostQueryRepository } from '../../repositories/post.queryRepository'
import { FilesMSEmitService } from '../../repositories/filesMSEmit.service'

const services = [PrismaService, FilesMSEmitService, BrowserServiceService, JwtAdapterService]

const repositories = [DevicesRepository, UserRepository, UserQueryRepository, PostQueryRepository]

const commandHandlers = [
	SetAvatarToMeHandler,
	GetUserAvatarHandler,
	DeleteUserAvatarHandler,
	EditMyProfileHandler,
	GetMyProfileHandler,
	// GetUserPostsHandler,
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
export class UserModule {}
