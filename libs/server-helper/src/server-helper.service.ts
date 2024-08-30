import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	NotImplementedException,
	UnauthorizedException,
} from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { ErrorCode } from '../../layerResult'

@Injectable()
export class ServerHelperService {
	convertLayerErrToHttpErr(err: unknown) {
		if (err instanceof Error) {
			const errorStatus = err.message as ErrorCode

			const httpErrorsMapper = {
				[ErrorCode.NotFound_404]: NotFoundException,
				[ErrorCode.Unauthorized_401]: UnauthorizedException,
				[ErrorCode.BadRequest_400]: BadRequestException,
				[ErrorCode.Forbidden_403]: ForbiddenException,
			}

			if (httpErrorsMapper[errorStatus]) {
				throw new httpErrorsMapper[errorStatus]()
			}
		}

		throw new NotImplementedException()
	}
	strUtils() {
		return {
			createUniqString() {
				return uuid()
			},
		}
	}
}
