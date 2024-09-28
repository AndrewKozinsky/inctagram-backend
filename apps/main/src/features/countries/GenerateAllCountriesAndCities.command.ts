import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CountryRepository } from '../../repositories/country.repository'
import { CityRepository } from '../../repositories/city.repository'
import { CountryService } from '../../routes/country/country.service'

export class GenerateAllCountriesAndCitiesCommand {
	constructor() {}
}

@CommandHandler(GenerateAllCountriesAndCitiesCommand)
export class GenerateAllCountriesAndCitiesHandler
	implements ICommandHandler<GenerateAllCountriesAndCitiesCommand>
{
	constructor(
		private countryRepository: CountryRepository,
		private cityRepository: CityRepository,
		private countryService: CountryService,
	) {}

	async execute(command: GenerateAllCountriesAndCitiesCommand) {
		this.countryService.getCountriesList()
	}
}
