import {
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	OnModuleInit,
	Patch,
	Post,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { Request } from 'express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { ClientProxy } from '@nestjs/microservices'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { EditMyProfileDtoModel, UploadAvatarFilePipe } from '../../models/user/user.input.model'
import {
	SetAvatarToMeCommand,
	SetAvatarToMeHandler,
} from '../../features/user/SetAvatarToMe.command'
import { CheckAccessTokenGuard } from '../../infrastructure/guards/checkAccessToken.guard'
import {
	GetUserAvatarCommand,
	GetUserAvatarHandler,
} from '../../features/user/GetUserAvatar.command'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import {
	DeleteUserAvatarCommand,
	DeleteUserAvatarHandler,
} from '../../features/user/DeleteUserAvatar.command'
import { usersRoutesConfig } from './usersRoutesConfig'
import {
	SWUserProfileRouteOut,
	SWUserMeAddAvatarRouteOut,
	SWUserMeGetAvatarRouteOut,
	SWGetUserPostsRouteOut,
	SWGetAllUsersRouteOut,
} from './swaggerTypes'
import {
	EditMyProfileCommand,
	EditMyProfileHandler,
} from '../../features/user/EditMyProfile.command'
import { GetMyProfileCommand, GetMyProfileHandler } from '../../features/user/GetMyProfile.command'
import { postsRoutesConfig } from '../post/postsRoutesConfig'
import { GetUserPostsHandler } from '../../features/posts/GetUserPosts.command'
import { GetUsersCommand, GetUsersHandler } from '../../features/user/GetUsers.command'

@ApiTags('User')
@Controller(RouteNames.USERS.value)
export class UserController implements OnModuleInit {
	constructor(
		private readonly commandBus: CommandBus,
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
	) {}

	async onModuleInit() {
		await this.filesMicroClient.connect()
	}

	@Get()
	@RouteDecorators(usersRoutesConfig.getUsers)
	async getUsers(): Promise<undefined | SWGetAllUsersRouteOut> {
		try {
			const res = await this.commandBus.execute<
				any,
				ReturnType<typeof GetUsersHandler.prototype.execute>
			>(new GetUsersCommand())

			return createSuccessResp(usersRoutesConfig.getUsers, res)
		} catch (err: any) {
			createFailResp(usersRoutesConfig.getUsers, err)
		}
	}

	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Patch(RouteNames.USERS.ME.value)
	@RouteDecorators(usersRoutesConfig.me.editProfile)
	async editMyProfile(
		@Req() req: Request,
		@Body() body: EditMyProfileDtoModel,
	): Promise<SWUserProfileRouteOut | undefined> {
		try {
			const res = await this.commandBus.execute<
				any,
				ReturnType<typeof EditMyProfileHandler.prototype.execute>
			>(new EditMyProfileCommand(req.user.id, body))

			return createSuccessResp(usersRoutesConfig.me.editProfile, res)
		} catch (err: any) {
			createFailResp(usersRoutesConfig.me.deleteAvatar, err)
		}
	}

	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Get(RouteNames.USERS.ME.value)
	@RouteDecorators(usersRoutesConfig.me.getProfile)
	async getMyProfile(@Req() req: Request): Promise<SWUserProfileRouteOut | undefined> {
		try {
			const res = await this.commandBus.execute<
				any,
				ReturnType<typeof GetMyProfileHandler.prototype.execute>
			>(new GetMyProfileCommand(req.user.id))

			return createSuccessResp(usersRoutesConfig.me.getProfile, res)
		} catch (err: any) {
			createFailResp(usersRoutesConfig.me.getProfile, err)
		}
	}

	@Get(':userId/' + RouteNames.USERS.USER_ID(1).POSTS.value)
	@RouteDecorators(usersRoutesConfig.posts.getUserPosts)
	async getUserPosts(@Req() req: Request): Promise<SWGetUserPostsRouteOut | null | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof GetUserPostsHandler.prototype.execute>
			>(new GetUserPostsHandler(req.user.id))

			return createSuccessResp(postsRoutesConfig.getPost, commandRes)
		} catch (err: any) {
			createFailResp(postsRoutesConfig.getPost, err)
		}
	}

	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'File must be loaded to the avatarFile property',
		type: 'multipart/form-data',
		schema: {
			type: 'object',
			properties: {
				avatarFile: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post([RouteNames.USERS.ME.value, RouteNames.USERS.ME.AVATAR.value].join('/'))
	@RouteDecorators(usersRoutesConfig.me.setAvatar)
	@UseInterceptors(FileInterceptor('avatarFile'))
	async setMyAvatar(
		@UploadedFile(new UploadAvatarFilePipe())
		avatarFile: Express.Multer.File,
		@Req() req: Request,
	): Promise<SWUserMeAddAvatarRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof SetAvatarToMeHandler.prototype.execute>
			>(new SetAvatarToMeCommand(req.user.id, avatarFile))

			return createSuccessResp(usersRoutesConfig.me.setAvatar, commandRes)
		} catch (err: any) {
			createFailResp(usersRoutesConfig.me.setAvatar, err)
		}
	}

	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Get([RouteNames.USERS.ME.value, RouteNames.USERS.ME.AVATAR.value].join('/'))
	@RouteDecorators(usersRoutesConfig.me.getAvatar)
	async getMyAvatar(@Req() req: Request): Promise<SWUserMeGetAvatarRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof GetUserAvatarHandler.prototype.execute>
			>(new GetUserAvatarCommand(req.user.id))

			return createSuccessResp(usersRoutesConfig.me.getAvatar, commandRes)
		} catch (err: any) {
			createFailResp(usersRoutesConfig.me.getAvatar, err)
		}
	}

	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Delete([RouteNames.USERS.ME.value, RouteNames.USERS.ME.AVATAR.value].join('/'))
	@RouteDecorators(usersRoutesConfig.me.deleteAvatar)
	async deleteMyAvatar(@Req() req: Request): Promise<SWEmptyRouteOut | undefined> {
		try {
			await this.commandBus.execute<
				any,
				ReturnType<typeof DeleteUserAvatarHandler.prototype.execute>
			>(new DeleteUserAvatarCommand(req.user.id))

			return createSuccessResp(usersRoutesConfig.me.deleteAvatar, null)
		} catch (err: any) {
			createFailResp(usersRoutesConfig.me.deleteAvatar, err)
		}
	}
}
