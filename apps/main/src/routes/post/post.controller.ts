import {
	Body,
	Controller,
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
import { CommandBus } from '@nestjs/cqrs'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ClientProxy } from '@nestjs/microservices'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { CheckAccessTokenGuard } from '../../infrastructure/guards/checkAccessToken.guard'
import { postsRoutesConfig } from './postsRoutesConfig'
import { SWAddPostRouteOut, SWGetPostRouteOut, SWUpdatePostRouteOut } from './swaggerTypes'
import { AddPostCommand, AddPostHandler } from '../../features/posts/AddPost.command'
import {
	CreatePostDtoModel,
	UpdatePostDtoModel,
	UploadPostImagesPipe,
} from '../../models/post/post.input.model'
import { GetPostCommand, GetPostHandler } from '../../features/posts/GetPost.command'
import { UpdatePostCommand, UpdatePostHandler } from '../../features/posts/UpdatePost.command'

@ApiTags('Post')
@Controller(RouteNames.POSTS.value)
export class PostController implements OnModuleInit {
	constructor(
		private readonly commandBus: CommandBus,
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
	) {}

	async onModuleInit() {
		await this.filesMicroClient.connect()
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
	async setPost(
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
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof GetPostHandler.prototype.execute>
			>(new GetPostCommand(postId))

			return createSuccessResp(postsRoutesConfig.getPost, commandRes)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.getPost, err)
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
	@Patch(':postId')
	@RouteDecorators(postsRoutesConfig.getPost)
	@UseInterceptors(FilesInterceptor('photoFiles'))
	async updatePost(
		@Param('postId') postId: number,
		@Body() body: UpdatePostDtoModel,
		@Req() req: Request,
		@UploadedFiles(new UploadPostImagesPipe())
		photoFiles: Express.Multer.File[],
	): Promise<SWUpdatePostRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof UpdatePostHandler.prototype.execute>
			>(new UpdatePostCommand(postId, req.user.id, body, photoFiles))

			return createSuccessResp(postsRoutesConfig.updatePost, commandRes)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.getPost, err)
		}
	}
}
