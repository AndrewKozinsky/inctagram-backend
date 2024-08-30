import { BadRequestException, Controller, Delete, HttpStatus, Res } from '@nestjs/common'
import { Response } from 'express'
import RouteNames from '../../settings/routeNames'
import { DbService } from '../../db/dbService'
import { MainConfigService } from '@app/config'

@Controller(RouteNames.TESTING.value)
export class TestsController {
	constructor(
		private dbService: DbService,
		private mainConfig: MainConfigService,
	) {}

	@Delete(RouteNames.TESTING.ALL_DATA.value)
	async deleteAllData(@Res() res: Response) {
		if (this.mainConfig.get().mode !== 'TEST') {
			throw new BadRequestException()
		}

		const isDropped = await this.dbService.drop()

		if (isDropped) {
			res.sendStatus(HttpStatus.NO_CONTENT)
			return
		}

		throw new BadRequestException()
	}
}
