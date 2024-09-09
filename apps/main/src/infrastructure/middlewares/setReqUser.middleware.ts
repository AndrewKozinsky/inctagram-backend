import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { UserRepository } from '../../repositories/user.repository'
import { JwtAdapterService } from '@app/jwt-adapter'

@Injectable()
export class SetReqUserMiddleware implements NestMiddleware {
	constructor(
		private jwtAdapter: JwtAdapterService,
		private userRepository: UserRepository,
	) {}

	async use(req: Request, res: Response, next: NextFunction) {
		const authorizationHeader = req.headers['authorization']
		if (!authorizationHeader) {
			next()
			return
		}

		const token = getBearerTokenFromStr(authorizationHeader)
		if (!token) {
			next()
			return
		}

		const userId = this.jwtAdapter.getUserIdByAccessTokenStr(token)
		if (!userId) {
			next()
			return
		}

		req.user = await this.userRepository.getUserById(userId)
		next()
	}
}

function getBearerTokenFromStr(authorizationHeader: string) {
	const [authType, token] = authorizationHeader.split(' ')

	if (authType !== 'Bearer' || !token) {
		return false
	}

	return token
}
