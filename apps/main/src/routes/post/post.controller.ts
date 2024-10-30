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
	UploadedFile,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { Request } from 'express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ClientProxy } from '@nestjs/microservices'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { CheckAccessTokenGuard } from '../../infrastructure/guards/checkAccessToken.guard'
import { postsRoutesConfig } from './postsRoutesConfig'
import { SWAddPostRouteOut, SWUploadPostPhotoRouteOut } from './swaggerTypes'
// import { AddPostCommand, AddPostHandler } from '../../features/posts/AddPost.command'
import {
	CreatePostDtoModel,
	UpdatePostDtoModel,
	UploadPostPhotoPipe,
} from '../../models/post/post.input.model'
// import { GetPostQuery, GetPostHandler } from '../../features/posts/GetPost.query'
// import { UpdatePostCommand, UpdatePostHandler } from '../../features/posts/UpdatePost.command'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import {
	UploadPostPhotoCommand,
	UploadPostPhotoHandler,
} from '../../features/posts/UploadPostPhoto.command'
import { AddPostCommand, AddPostHandler } from '../../features/posts/AddPost.command'
import {
	DeletePostPhotoCommand,
	DeletePostPhotoHandler,
} from '../../features/posts/DeletePostPhoto.command'
// import { DeletePostCommand, DeletePostHandler } from '../../features/posts/DeletePost.command'
/*import {
	GetRecentPostsQuery,
	GetRecentPostsHandler,
} from '../../features/posts/GetRecentPosts.query'*/

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

	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Images must be loaded to the photoFiles property',
		type: 'multipart/form-data',
		schema: {
			type: 'object',
			properties: {
				photoFile: {
					format: 'binary',
				},
			},
		},
	})
	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@UseGuards(CheckAccessTokenGuard)
	@Post(RouteNames.POSTS.PHOTOS.value)
	@RouteDecorators(postsRoutesConfig.uploadPostPhoto)
	@UseInterceptors(FileInterceptor('postPhotoFile'))
	async uploadPostPhoto(
		@UploadedFile(new UploadPostPhotoPipe())
		postPhotoFile: Express.Multer.File,
	): Promise<SWUploadPostPhotoRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof UploadPostPhotoHandler.prototype.execute>
			>(new UploadPostPhotoCommand(postPhotoFile))

			return createSuccessResp(postsRoutesConfig.uploadPostPhoto, commandRes)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.uploadPostPhoto, err)
		}
		// return undefined
	}

	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@UseGuards(CheckAccessTokenGuard)
	@Delete(RouteNames.POSTS.PHOTOS.value + '/:postPhotoId')
	@RouteDecorators(postsRoutesConfig.deletePostPhoto)
	async deletePostPhoto(
		@Param('postPhotoId') postPhotoId: string,
	): Promise<SWEmptyRouteOut | undefined> {
		try {
			await this.commandBus.execute<
				any,
				ReturnType<typeof DeletePostPhotoHandler.prototype.execute>
			>(new DeletePostPhotoCommand(postPhotoId))

			return createSuccessResp(postsRoutesConfig.deletePostPhoto, null)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.deletePostPhoto, err)
		}
	}

	/*@Get(RouteNames.POSTS.RECENT.value)
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
	}*/

	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@UseGuards(CheckAccessTokenGuard)
	@Post()
	@RouteDecorators(postsRoutesConfig.createPost)
	async createPost(
		@Body() body: CreatePostDtoModel,
		@Req() req: Request,
	): Promise<SWAddPostRouteOut | undefined> {
		try {
			const commandRes: any = await this.commandBus.execute<
				any,
				ReturnType<typeof AddPostHandler.prototype.execute>
			>(new AddPostCommand(req.user.id, body))

			return createSuccessResp(postsRoutesConfig.createPost, commandRes)
		} catch (err: any) {
			console.log(err)
			createFailResp(postsRoutesConfig.createPost, err)
		}
	}

	/*@Get(':postId')
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
	}*/

	/*@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@UseGuards(CheckAccessTokenGuard)
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
	}*/

	/*@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@UseGuards(CheckAccessTokenGuard)
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
	}*/
}
