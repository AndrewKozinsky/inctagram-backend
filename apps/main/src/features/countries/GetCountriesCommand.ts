import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { GeoService } from '../../routes/geo/geo.service'

export class GetCountriesCommand {
	constructor() {}
}

@CommandHandler(GetCountriesCommand)
export class GetCountriesHandler implements ICommandHandler<GetCountriesCommand> {
	constructor(private countryService: GeoService) {}

	async execute(command: GetCountriesCommand) {
		return await this.countryService.getAllCountries()
	}
}
