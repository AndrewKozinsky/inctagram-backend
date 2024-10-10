import {
	Body,
	Controller,
	Inject,
	OnModuleInit,
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
import { SWAddPostRouteOut } from './swaggerTypes'
import { AddPostCommand, AddPostHandler } from '../../features/posts/AddPost.command'
import { CreatePostDtoModel, UploadPostImagesPipe } from '../../models/post/post.input.model'

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
	async setMyAvatar(
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
}
