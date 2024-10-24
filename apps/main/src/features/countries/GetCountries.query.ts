import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { GeoService } from '../../routes/geo/geo.service'

export class GetCountriesQuery {
	constructor() {}
}

@QueryHandler(GetCountriesQuery)
export class GetCountriesHandler implements IQueryHandler<GetCountriesQuery> {
	constructor(private countryService: GeoService) {}

	async execute(command: GetCountriesQuery) {
		return await this.countryService.getAllCountries()
	}
}
