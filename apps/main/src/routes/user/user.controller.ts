import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { CommandBus } from '@nestjs/cqrs'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { routesConfig } from '../routesConfig/routesConfig'
import { SWUserMeAddAvatarRouteOut } from '../auth/swaggerTypes'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { FileInterceptor } from '@nestjs/platform-express'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { UploadAvatarFilePipe } from '../../models/user/user.input.model'
import {
	SetAvatarToMeCommand,
	SetAvatarToMeHandler,
} from '../../features/user/SetAvatarToMe.commandHandler'

@ApiTags('User')
@Controller(RouteNames.USERS.value)
export class UserController {
	constructor(private readonly commandBus: CommandBus) {}

	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'File must be loaded to the avatarFile property',
		type: 'multipart/form-data',
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post([RouteNames.USERS.ME.value, RouteNames.USERS.ME.AVATAR.value].join('/'))
	@RouteDecorators(routesConfig.users.me.setAvatar)
	@UseInterceptors(FileInterceptor('avatarFile'))
	async setAvatarToMe(
		@UploadedFile(new UploadAvatarFilePipe())
		avatarFile: Express.Multer.File,
	): Promise<SWUserMeAddAvatarRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof SetAvatarToMeHandler.prototype.execute>
			>(new SetAvatarToMeCommand(avatarFile))

			return createSuccessResp(routesConfig.users.me.setAvatar, commandRes)
		} catch (err: any) {
			console.log(err)
			createFailResp(routesConfig.users.me.setAvatar, err)
		}
	}
}
