import {
	Controller,
	Delete,
	Get,
	Inject,
	OnModuleInit,
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
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { routesConfig } from '../routesConfig/routesConfig'
import { SWUserMeAddAvatarRouteOut, SWUserMeGetAvatarRouteOut } from '../auth/swaggerTypes'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { UploadAvatarFilePipe } from '../../models/user/user.input.model'
import {
	SetAvatarToMeCommand,
	SetAvatarToMeHandler,
} from '../../features/user/SetAvatarToMe.command'
import { ClientProxy } from '@nestjs/microservices'
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
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post([RouteNames.USERS.ME.value, RouteNames.USERS.ME.AVATAR.value].join('/'))
	@RouteDecorators(routesConfig.users.me.setAvatar)
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

			return createSuccessResp(routesConfig.users.me.setAvatar, commandRes)
		} catch (err: any) {
			createFailResp(routesConfig.users.me.setAvatar, err)
		}
	}

	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Get([RouteNames.USERS.ME.value, RouteNames.USERS.ME.AVATAR.value].join('/'))
	@RouteDecorators(routesConfig.users.me.getAvatar)
	async getMyAvatar(@Req() req: Request): Promise<SWUserMeGetAvatarRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof GetUserAvatarHandler.prototype.execute>
			>(new GetUserAvatarCommand(req.user.id))

			return createSuccessResp(routesConfig.users.me.getAvatar, commandRes)
		} catch (err: any) {
			createFailResp(routesConfig.users.me.getAvatar, err)
		}
	}

	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Delete([RouteNames.USERS.ME.value, RouteNames.USERS.ME.AVATAR.value].join('/'))
	@RouteDecorators(routesConfig.users.me.deleteAvatar)
	async deleteMyAvatar(@Req() req: Request): Promise<SWEmptyRouteOut | undefined> {
		try {
			await this.commandBus.execute<
				any,
				ReturnType<typeof DeleteUserAvatarHandler.prototype.execute>
			>(new DeleteUserAvatarCommand(req.user.id))

			return createSuccessResp(routesConfig.users.me.deleteAvatar, null)
		} catch (err: any) {
			createFailResp(routesConfig.users.me.deleteAvatar, err)
		}
	}
}
