import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CountryController } from './country.controller'
import { CountryRepository } from '../../repositories/country.repository'
import { CityRepository } from '../../repositories/city.repository'
import { GenerateAllCountriesAndCitiesCommand } from '../../features/countries/GenerateAllCountriesAndCities.command'
import { CountryService } from './country.service'

const services = [CountryService]

const repositories = [CountryRepository, CityRepository]

const commandHandlers = [GenerateAllCountriesAndCitiesCommand]

@Module({
	imports: [CqrsModule],
	controllers: [CountryController],
	providers: [...services, ...repositories, ...commandHandlers],
})
export class CountryModule {}
