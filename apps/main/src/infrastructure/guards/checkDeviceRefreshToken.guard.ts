import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { JwtAdapterService } from '@app/jwt-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { CustomException } from '../exceptionFilters/customException'
import { HTTP_STATUSES } from '../../utils/httpStatuses'
import { DevicesRepository } from '../../repositories/devices.repository'
import { ErrorMessage } from '@app/shared'

@Injectable()
export class CheckDeviceRefreshTokenGuard implements CanActivate {
	constructor(
		private browserService: BrowserServiceService,
		private jwtAdapter: JwtAdapterService,
		private securityRepository: DevicesRepository,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()

		try {
			const refreshTokenStr = this.browserService.getRefreshTokenStrFromReq(request)

			if (!refreshTokenStr || !this.jwtAdapter.isRefreshTokenStrValid(refreshTokenStr)) {
				throw CustomException(
					HTTP_STATUSES.UNAUTHORIZED_401.toString(),
					ErrorMessage.RefreshTokenIsNotValid,
				)
			}

			// Check if refreshTokenStr has another expiration date
			const refreshTokenStrExpirationDate =
				this.jwtAdapter.getTokenStrExpirationDate(refreshTokenStr)

			const deviceRefreshToken =
				await this.securityRepository.getDeviceRefreshTokenByTokenStr(refreshTokenStr)

			if (!refreshTokenStrExpirationDate || !deviceRefreshToken) {
				throw CustomException(
					HTTP_STATUSES.UNAUTHORIZED_401.toString(),
					ErrorMessage.RefreshTokenIsNotValid,
				)
			}

			if (
				deviceRefreshToken!.expirationDate !== refreshTokenStrExpirationDate!.toISOString()
			) {
				throw CustomException(
					HTTP_STATUSES.UNAUTHORIZED_401.toString(),
					ErrorMessage.RefreshTokenIsNotValid,
				)
			}

			request.deviceRefreshToken = deviceRefreshToken
			return true
		} catch (err: unknown) {
			throw CustomException(
				HTTP_STATUSES.UNAUTHORIZED_401.toString(),
				ErrorMessage.RefreshTokenIsNotValid,
			)
		}
	}
}
