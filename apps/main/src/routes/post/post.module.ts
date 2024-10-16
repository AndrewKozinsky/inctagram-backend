import { Module } from '@nestjs/common'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'
import { CqrsModule } from '@nestjs/cqrs'
import { BrowserServiceService } from '@app/browser-service'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import { PrismaService } from '../../db/prisma.service'
import { PostController } from './post.controller'
import { AddPostHandler } from '../../features/posts/AddPost.command'
import { PostRepository } from '../../repositories/post.repository'
import { DevicesRepository } from '../../repositories/devices.repository'
import { PostQueryRepository } from '../../repositories/post.queryRepository'
import { PostPhotoRepository } from '../../repositories/postPhoto.repository'

const services = [PrismaService, BrowserServiceService, JwtAdapterService]

const repositories = [DevicesRepository, PostRepository, PostQueryRepository, PostPhotoRepository]

const commandHandlers = [AddPostHandler]

@Module({
	imports: [CqrsModule],
	controllers: [PostController],
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
export class PostModule {}
