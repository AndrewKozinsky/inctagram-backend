import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CountryService } from '../../routes/country/country.service'
import { GetCountryCitiesQueries } from '../../models/geo/geo.input.model'

export class GetCountryCitiesCommand {
	constructor(
		public countryCode: string,
		public query: GetCountryCitiesQueries,
	) {}
}

@CommandHandler(GetCountryCitiesCommand)
export class GetCountryCitiesHandler implements ICommandHandler<GetCountryCitiesCommand> {
	constructor(private countryService: CountryService) {}

	async execute(command: GetCountryCitiesCommand) {
		const { countryCode, query } = command

		return await this.countryService.getCountryCities(countryCode, query)
	}
}
