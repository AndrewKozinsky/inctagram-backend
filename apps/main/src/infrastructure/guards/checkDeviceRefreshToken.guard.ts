import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtAdapterService } from '@app/jwt-adapter'
import { AuthRepository } from '../../repositories/auth.repository'
import { BrowserServiceService } from '@app/browser-service'

@Injectable()
export class CheckDeviceRefreshTokenGuard implements CanActivate {
	constructor(
		private readonly browserService: BrowserServiceService,
		private jwtAdapter: JwtAdapterService,
		private readonly authRepository: AuthRepository,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()

		try {
			const refreshTokenStr = this.browserService.getRefreshTokenStrFromReq(request)

			if (!refreshTokenStr || !this.jwtAdapter.isRefreshTokenStrValid(refreshTokenStr)) {
				throw new UnauthorizedException()
			}

			// Check if refreshTokenStr has another expiration date
			const refreshTokenStrExpirationDate =
				this.jwtAdapter.getTokenStrExpirationDate(refreshTokenStr)

			const deviceRefreshToken =
				await this.authRepository.getDeviceRefreshTokenByTokenStr(refreshTokenStr)

			if (!refreshTokenStrExpirationDate || !deviceRefreshToken) {
				throw new UnauthorizedException()
			}

			if (
				refreshTokenStrExpirationDate!.toLocaleString() ===
				deviceRefreshToken!.expirationDate.toLocaleString()
			) {
				request.deviceRefreshToken = deviceRefreshToken
				return true
			}

			throw new UnauthorizedException()
		} catch (err: unknown) {
			throw new UnauthorizedException()
		}
	}
}
