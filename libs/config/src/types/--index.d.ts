declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string
			MAIN_MICROSERVICE_PORT: string
		}
	}
}
