import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { GeoController } from './geo.controller'
import { GetCountriesHandler } from '../../features/countries/GetCountries.command'
import { GeoService } from './geo.service'
import { GetCountryCitiesHandler } from '../../features/countries/GetCountryCities.command'
import { GetCityHandler } from '../../features/countries/GetCity.command'

const services = [GeoService]

const repositories: any[] = []

const commandHandlers = [GetCountriesHandler, GetCountryCitiesHandler, GetCityHandler]

@Module({
	imports: [CqrsModule],
	controllers: [GeoController],
	providers: [...services, ...repositories, ...commandHandlers],
})
export class GeoModule {}
