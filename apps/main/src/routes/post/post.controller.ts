import {
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	OnModuleInit,
	Param,
	Patch,
	Post,
	Req,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { Request } from 'express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ClientProxy } from '@nestjs/microservices'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { CheckAccessTokenGuard } from '../../infrastructure/guards/checkAccessToken.guard'
import { postsRoutesConfig } from './postsRoutesConfig'
import {
	SWAddPostRouteOut,
	SWGetPostRouteOut,
	SWGetRecentPostRouteOut,
	SWUpdatePostRouteOut,
} from './swaggerTypes'
import { AddPostCommand, AddPostHandler } from '../../features/posts/AddPost.command'
import {
	CreatePostDtoModel,
	UpdatePostDtoModel,
	UploadPostImagesPipe,
} from '../../models/post/post.input.model'
import { GetPostQuery, GetPostHandler } from '../../features/posts/GetPost.query'
import { UpdatePostCommand, UpdatePostHandler } from '../../features/posts/UpdatePost.command'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import { DeletePostCommand, DeletePostHandler } from '../../features/posts/DeletePost.command'
import {
	GetRecentPostsQuery,
	GetRecentPostsHandler,
} from '../../features/posts/GetRecentPosts.query'

@ApiTags('Post')
@Controller(RouteNames.POSTS.value)
export class PostController implements OnModuleInit {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
	) {}

	async onModuleInit() {
		await this.filesMicroClient.connect()
	}

	@Get(RouteNames.POSTS.RECENT.value)
	@RouteDecorators(postsRoutesConfig.getRecentPosts)
	async getRecentPost(): Promise<SWGetRecentPostRouteOut | undefined> {
		try {
			const commandRes = await this.queryBus.execute<
				any,
				ReturnType<typeof GetRecentPostsHandler.prototype.execute>
			>(new GetRecentPostsQuery())

			return createSuccessResp(postsRoutesConfig.getRecentPosts, commandRes)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.getRecentPosts, err)
		}
	}

	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Images must be loaded to the photoFiles property',
		type: 'multipart/form-data',
		schema: {
			type: 'object',
			properties: {
				photoFiles: {
					type: 'array',
					items: {
						format: 'binary',
					},
				},
			},
		},
	})
	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post()
	@RouteDecorators(postsRoutesConfig.createPost)
	@UseInterceptors(FilesInterceptor('photoFiles'))
	async createPost(
		@Body() body: CreatePostDtoModel,
		@UploadedFiles(new UploadPostImagesPipe())
		photoFiles: Express.Multer.File[],
		@Req() req: Request,
	): Promise<SWAddPostRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof AddPostHandler.prototype.execute>
			>(new AddPostCommand(req.user.id, body, photoFiles))

			return createSuccessResp(postsRoutesConfig.createPost, commandRes)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.createPost, err)
		}
	}

	@Get(':postId')
	@RouteDecorators(postsRoutesConfig.getPost)
	async getPost(@Param('postId') postId: number): Promise<SWGetPostRouteOut | undefined> {
		try {
			const commandRes = await this.queryBus.execute<
				any,
				ReturnType<typeof GetPostHandler.prototype.execute>
			>(new GetPostQuery(postId))

			return createSuccessResp(postsRoutesConfig.getPost, commandRes)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.getPost, err)
		}
	}

	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Patch(':postId')
	@RouteDecorators(postsRoutesConfig.getPost)
	async updatePost(
		@Param('postId') postId: number,
		@Body() body: UpdatePostDtoModel,
		@Req() req: Request,
	): Promise<SWUpdatePostRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof UpdatePostHandler.prototype.execute>
			>(new UpdatePostCommand(postId, req.user.id, body))

			return createSuccessResp(postsRoutesConfig.updatePost, commandRes)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.updatePost, err)
		}
	}

	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Delete(':postId')
	@RouteDecorators(postsRoutesConfig.deletePost)
	async deletePost(
		@Param('postId') postId: number,
		@Req() req: Request,
	): Promise<SWEmptyRouteOut | undefined> {
		try {
			await this.commandBus.execute<
				any,
				ReturnType<typeof DeletePostHandler.prototype.execute>
			>(new DeletePostCommand(postId, req.user.id))

			return createSuccessResp(postsRoutesConfig.deletePost, null)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.deletePost, err)
		}
	}
}
