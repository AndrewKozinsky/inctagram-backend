import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CountryController } from './country.controller'
import { GetCountriesHandler } from '../../features/countries/GetCountriesCommand'
import { CountryService } from './country.service'
import { GetCountryCitiesHandler } from '../../features/countries/GetCountryCitiesCommand'
import { GetCityHandler } from '../../features/countries/GetCityCommand'

const services = [CountryService]

const repositories: any[] = []

const commandHandlers = [GetCountriesHandler, GetCountryCitiesHandler, GetCityHandler]

@Module({
	imports: [CqrsModule],
	controllers: [CountryController],
	providers: [...services, ...repositories, ...commandHandlers],
})
export class CountryModule {}
