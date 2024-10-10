import { Injectable } from '@nestjs/common'
import jwt, { decode } from 'jsonwebtoken'
import { add, addMilliseconds } from 'date-fns'
import { MainConfigService } from '@app/config'
import { DeviceTokenServiceModel } from '../../../apps/main/src/models/auth/auth.service.model'
import { createUniqString } from '@app/shared'

@Injectable()
export class JwtAdapterService {
	constructor(private mainConfig: MainConfigService) {}

	createAccessTokenStr(userId: number) {
		return jwt.sign({ userId }, this.mainConfig.get().jwt.secret, {
			expiresIn: this.mainConfig.get().accessToken.lifeDurationInMs / 1000 + 's',
		})
	}

	createRefreshTokenStr(deviceId: string, expirationDate?: string): string {
		const defaultExpDate = add(new Date(), {
			seconds: this.mainConfig.get().refreshToken.lifeDurationInMs / 1000,
		})

		const expDate = expirationDate || defaultExpDate

		return jwt.sign({ deviceId }, this.mainConfig.get().jwt.secret, {
			expiresIn: (+new Date(expDate) - +new Date()) / 1000 + 's',
		})
	}

	createDeviceRefreshToken(
		userId: number,
		deviceIP: string,
		deviceName: string,
	): DeviceTokenServiceModel {
		const deviceId = createUniqString()

		const expirationDate = addMilliseconds(
			new Date(),
			this.mainConfig.get().refreshToken.lifeDurationInMs,
		)
		expirationDate.setMilliseconds(0)

		return {
			issuedAt: new Date().toISOString(),
			expirationDate: expirationDate.toISOString(),
			deviceIP,
			deviceId,
			deviceName,
			userId,
		}
	}

	getUserIdByAccessTokenStr(accessToken: string): null | number {
		try {
			const result: any = jwt.verify(accessToken, this.mainConfig.get().jwt.secret)
			return result.userId
		} catch (error) {
			return null
		}
	}

	getRefreshTokenDataFromTokenStr(refreshTokenStr: string) {
		try {
			const payload = jwt.verify(refreshTokenStr, this.mainConfig.get().jwt.secret)
			return payload as { deviceId: string }
		} catch (error) {
			console.log(error)
			return null
		}
	}

	// Check if token string is valid
	isRefreshTokenStrValid(refreshTokenStr: string = '') {
		try {
			const tokenPayload = jwt.verify(refreshTokenStr, this.mainConfig.get().jwt.secret)
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	getTokenStrExpirationDate(tokenStr: string): null | Date {
		try {
			const tokenPayload = decode(tokenStr)

			if (!tokenPayload || typeof tokenPayload === 'string') {
				return null
			}

			// @ts-ignore
			return new Date(tokenPayload.exp * 1000)
		} catch (error) {
			console.log(error)
			return null
		}
	}
}
