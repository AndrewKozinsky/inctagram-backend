import { HttpStatus, INestApplication } from '@nestjs/common'
import { agent as request } from 'supertest'
import RouteNames from '../../src/routes/routesConfig/routeNames'

export async function clearAllDB(app: INestApplication<any>) {
	await request(app.getHttpServer())
		.delete('/' + RouteNames.TESTING.ALL_DATA.full)
		.expect(HttpStatus.NO_CONTENT)
}
