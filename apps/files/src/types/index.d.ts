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

// DELETE
/*declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MODE: 'TEST'
			POSTGRES_DB_URL: string
			MAIN_MICROSERVICE_PORT: number
			OAUT_GITHUB_CLIENT_ID_LOCAL_TO_LOCAL: string
			OAUT_GITHUB_CLIENT_SECRET_LOCAL_TO_LOCAL: string
			OAUT_GOOGLE_CLIENT_ID: string
			OAUT_GOOGLE_CLIENT_SECRET: string
			RECAPTCHA_SERVER_KEY: string
		}
	}
}*/
