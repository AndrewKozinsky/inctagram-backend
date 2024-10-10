import { Injectable } from '@nestjs/common'
import { MainConfigService } from '@app/config'
import { Response } from 'express'

@Injectable()
export class UserService {
	constructor(private mainConfig: MainConfigService) {}

	setRefreshTokenInCookie(res: Response, refreshTokenStr: string) {
		res.cookie(this.mainConfig.get().refreshToken.name, refreshTokenStr, {
			maxAge: this.mainConfig.get().refreshToken.lifeDurationInMs,
			httpOnly: false,
			secure: false,
			sameSite: 'none',
		})
	}
}
