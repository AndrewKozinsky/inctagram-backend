import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { GeoService } from '../../routes/geo/geo.service'
import { GetCountryCitiesQueries } from '../../models/geo/geo.input.model'
import { GetUsersQuery } from '../user/GetUsers.query'

export class GetCountryCitiesQuery {
	constructor(
		public countryCode: string,
		public query: GetCountryCitiesQueries,
	) {}
}

@QueryHandler(GetCountryCitiesQuery)
export class GetCountryCitiesHandler implements IQueryHandler<GetCountryCitiesQuery> {
	constructor(private countryService: GeoService) {}

	async execute(command: GetCountryCitiesQuery) {
		const { countryCode, query } = command

		return await this.countryService.getCountryCities(countryCode, query)
	}
}
