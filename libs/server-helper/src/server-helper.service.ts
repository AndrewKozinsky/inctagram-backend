import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	NotImplementedException,
	UnauthorizedException,
} from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { LayerErrorCode } from '../../layerResult'

@Injectable()
export class ServerHelperService {
	convertLayerErrToHttpErr(err: unknown) {
		if (err instanceof Error) {
			const errorStatus = err.message as LayerErrorCode

			const httpErrorsMapper = {
				[LayerErrorCode.NotFound_404]: NotFoundException,
				[LayerErrorCode.Unauthorized_401]: UnauthorizedException,
				[LayerErrorCode.BadRequest_400]: BadRequestException,
				[LayerErrorCode.Forbidden_403]: ForbiddenException,
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
