import {
	Body,
	Controller,
	FileTypeValidator,
	HttpStatus,
	MaxFileSizeValidator,
	ParseFilePipe,
	ParseFilePipeBuilder,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { CommandBus } from '@nestjs/cqrs'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { routesConfig } from '../routesConfig/routesConfig'
import { SWUserMeAddAvatarRouteOut } from '../auth/swaggerTypes'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { FileInterceptor } from '@nestjs/platform-express'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { UploadAvatarFilePipe } from '../../models/user/user.input.model'

@ApiTags('User')
@Controller(RouteNames.USERS.value)
export class UserController {
	constructor(private readonly commandBus: CommandBus) {}

	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post([RouteNames.USERS.ME.value, RouteNames.USERS.ME.AVATAR.value].join('/'))
	@RouteDecorators(routesConfig.users.me.addAvatar)
	async addAvatarToMe(
		@UploadedFile(new UploadAvatarFilePipe())
		avatarFile: Express.Multer.File,
	): Promise<SWUserMeAddAvatarRouteOut | undefined> {
		try {
			/*const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof CreateUserHandler.prototype.execute>
			>(new CreateUserCommand(body))*/

			const commandRes = {
				avatarUrl: 'avatarUrl',
			}

			return createSuccessResp(routesConfig.users.me.addAvatar, commandRes)
		} catch (err: any) {
			createFailResp(routesConfig.users.me.addAvatar, err)
		}
	}
}
