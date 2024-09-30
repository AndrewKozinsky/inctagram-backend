import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CountryService } from '../../routes/country/country.service'

export class GetCountriesCommand {
	constructor() {}
}

@CommandHandler(GetCountriesCommand)
export class GetCountriesHandler implements ICommandHandler<GetCountriesCommand> {
	constructor(private countryService: CountryService) {}

	async execute(command: GetCountriesCommand) {
		return await this.countryService.getAllCountries()
	}
}
