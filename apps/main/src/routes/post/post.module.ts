import { Module } from '@nestjs/common'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'
import { CqrsModule } from '@nestjs/cqrs'
import { BrowserServiceService } from '@app/browser-service'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import { PrismaService } from '../../db/prisma.service'
import { PostController } from './post.controller'
import { PostRepository } from '../../repositories/post.repository'
import { DevicesRepository } from '../../repositories/devices.repository'
import { PostQueryRepository } from '../../repositories/post.queryRepository'
// import { AddPostHandler } from '../../features/posts/AddPost.command'
// import { GetPostHandler } from '../../features/posts/GetPost.query'
// import { UpdatePostHandler } from '../../features/posts/UpdatePost.command'
// import { DeletePostHandler } from '../../features/posts/DeletePost.command'
// import { GetRecentPostsHandler } from '../../features/posts/GetRecentPosts.query'
import { FilesMSEmitService } from '../../repositories/filesMSEmit.service'

const services = [PrismaService, FilesMSEmitService, BrowserServiceService, JwtAdapterService]

const repositories = [DevicesRepository, PostRepository, PostQueryRepository]

/*const commandHandlers = [
	AddPostHandler,
	GetPostHandler,
	UpdatePostHandler,
	DeletePostHandler,
	GetRecentPostsHandler,
]*/
const commandHandlers: any[] = []

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
