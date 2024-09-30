import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CountryService } from '../../routes/country/country.service'
import { GetCountryCitiesQueries } from '../../models/geo/geo.input.model'

export class GetCityCommand {
	constructor(
		public countryCode: string,
		public cityId: number,
	) {}
}

@CommandHandler(GetCityCommand)
export class GetCityHandler implements ICommandHandler<GetCityCommand> {
	constructor(private countryService: CountryService) {}

	async execute(command: GetCityCommand) {
		const { countryCode, cityId } = command

		return await this.countryService.getCityById(countryCode, cityId)
	}
}
