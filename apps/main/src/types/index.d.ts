import { UserServiceModel } from '../models/service/users.service.model'

declare global {
	namespace Express {
		export interface Request {
			user: null | UserServiceModel
			// deviceRefreshToken: undefined | null | DBTypes.DeviceToken
		}
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string
		}
	}
}
