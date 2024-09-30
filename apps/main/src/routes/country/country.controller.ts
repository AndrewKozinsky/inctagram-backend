import { Controller, Get, Param, Query } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { countryRoutesConfig } from './countryRoutesConfig'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import {
	GetCountriesCommand,
	GetCountriesHandler,
} from '../../features/countries/GetCountriesCommand'
import {
	SWGetCityRouteOut,
	SWGetCountriesRouteOut,
	SWGetCountryCitiesRouteOut,
} from './swaggerTypes'
import {
	GetCountryCitiesCommand,
	GetCountryCitiesHandler,
} from '../../features/countries/GetCountryCitiesCommand'
import {
	GetCountryCitiesQueries,
	GetCountryCitiesQueriesPipe,
} from '../../models/geo/geo.input.model'
import { GetCityCommand, GetCityHandler } from '../../features/countries/GetCityCommand'

@ApiTags('Geo')
@Controller(RouteNames.GEO.value)
export class CountryController {
	constructor(private commandBus: CommandBus) {}

	@Get(RouteNames.GEO.COUNTRIES.value)
	@RouteDecorators(countryRoutesConfig.getCountries)
	async getCountries(): Promise<undefined | SWGetCountriesRouteOut> {
		try {
			const countries = await this.commandBus.execute<
				any,
				ReturnType<typeof GetCountriesHandler.prototype.execute>
			>(new GetCountriesCommand())

			return createSuccessResp(countryRoutesConfig.getCountries, { countries })
		} catch (err: any) {
			createFailResp(countryRoutesConfig.getCountries, err)
		}
	}

	@Get(
		[
			RouteNames.GEO.COUNTRIES.value,
			':countryCode',
			RouteNames.GEO.COUNTRIES.COUNTRY_ID('').CITIES.value,
		].join('/'),
	)
	@RouteDecorators(countryRoutesConfig.getCountryCities)
	async getCountryCities(
		@Query(new GetCountryCitiesQueriesPipe()) query: GetCountryCitiesQueries,
		@Param('countryCode') countryCode: string,
	): Promise<undefined | SWGetCountryCitiesRouteOut> {
		try {
			const cities = await this.commandBus.execute<
				any,
				ReturnType<typeof GetCountryCitiesHandler.prototype.execute>
			>(new GetCountryCitiesCommand(countryCode, query))

			return createSuccessResp(countryRoutesConfig.getCountryCities, { cities })
		} catch (err: any) {
			createFailResp(countryRoutesConfig.getCountryCities, err)
		}
	}

	@Get(
		[
			RouteNames.GEO.COUNTRIES.value,
			':countryCode',
			RouteNames.GEO.COUNTRIES.COUNTRY_ID('').CITIES.value,
			':cityId',
		].join('/'),
	)
	@RouteDecorators(countryRoutesConfig.getCity)
	async getCity(
		@Param('countryCode') countryCode: string,
		@Param('cityId') cityId: number,
	): Promise<undefined | SWGetCityRouteOut> {
		try {
			const city = await this.commandBus.execute<
				any,
				ReturnType<typeof GetCityHandler.prototype.execute>
			>(new GetCityCommand(countryCode, cityId))

			return createSuccessResp(countryRoutesConfig.getCity, city)
		} catch (err: any) {
			createFailResp(countryRoutesConfig.getCity, err)
		}
	}
}
