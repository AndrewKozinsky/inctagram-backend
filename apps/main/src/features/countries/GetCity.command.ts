import { ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { GeoService } from '../../routes/geo/geo.service'
import { GetUsersQuery } from '../user/GetUsers.query'

export class GetCityQuery {
	constructor(
		public countryCode: string,
		public cityId: number,
	) {}
}

@QueryHandler(GetCityQuery)
export class GetCityHandler implements IQueryHandler<GetCityQuery> {
	constructor(private countryService: GeoService) {}

	async execute(command: GetCityQuery) {
		const { countryCode, cityId } = command

		return await this.countryService.getCityById(countryCode, cityId)
	}
}
