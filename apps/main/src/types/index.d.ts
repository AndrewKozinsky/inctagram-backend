import { UserServiceModel } from '../models/service/users.service.model'
import { DeviceTokenOutModel } from '../models/auth/auth.output.model'

declare global {
	namespace Express {
		export interface Request {
			user: null | UserServiceModel
			deviceRefreshToken: undefined | null | DeviceTokenOutModel
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
