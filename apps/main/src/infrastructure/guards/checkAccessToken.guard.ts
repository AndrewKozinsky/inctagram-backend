import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CustomException } from '../exceptionFilters/customException'
import { HTTP_STATUSES } from '../../utils/httpStatuses'
import { ErrorMessage } from '@app/server-helper'

@Injectable()
export class CheckAccessTokenGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest()

		const isRequestAllowed = !!request.user

		if (!isRequestAllowed) {
			throw CustomException(
				HTTP_STATUSES.UNAUTHORIZED_401.toString(),
				ErrorMessage.AccessTokenIsNotValid,
			)
		}

		return true
	}
}
