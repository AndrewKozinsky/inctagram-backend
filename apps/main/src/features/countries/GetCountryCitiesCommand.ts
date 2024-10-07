import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { GeoService } from '../../routes/geo/geo.service'
import { GetCountryCitiesQueries } from '../../models/geo/geo.input.model'

export class GetCountryCitiesCommand {
	constructor(
		public countryCode: string,
		public query: GetCountryCitiesQueries,
	) {}
}

@CommandHandler(GetCountryCitiesCommand)
export class GetCountryCitiesHandler implements ICommandHandler<GetCountryCitiesCommand> {
	constructor(private countryService: GeoService) {}

	async execute(command: GetCountryCitiesCommand) {
		const { countryCode, query } = command

		return await this.countryService.getCountryCities(countryCode, query)
	}
}
