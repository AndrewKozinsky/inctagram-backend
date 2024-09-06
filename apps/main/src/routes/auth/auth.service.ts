import { Injectable } from '@nestjs/common'
import { MainConfigService } from '@app/config'
import { Response } from 'express'

@Injectable()
export class AuthService {
	constructor(private mainConfig: MainConfigService) {}

	setRefreshTokenInCookie(res: Response, refreshTokenStr: string) {
		res.cookie(this.mainConfig.get().refreshToken.name, refreshTokenStr, {
			maxAge: this.mainConfig.get().refreshToken.lifeDurationInMs / 1000,
			httpOnly: true,
			secure: true,
		})
	}
}
