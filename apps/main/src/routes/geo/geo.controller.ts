import { Controller, Get, Param, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { geoRoutesConfig } from './geoRoutesConfig'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { GetCountriesHandler, GetCountriesQuery } from '../../features/countries/GetCountries.query'
import {
	SWGetCityRouteOut,
	SWGetCountriesRouteOut,
	SWGetCountryCitiesRouteOut,
} from './swaggerTypes'
import {
	GetCountryCitiesHandler,
	GetCountryCitiesQuery,
} from '../../features/countries/GetCountryCities.query'
import {
	GetCountryCitiesQueries,
	GetCountryCitiesQueriesPipe,
} from '../../models/geo/geo.input.model'
import { GetCityHandler, GetCityQuery } from '../../features/countries/GetCity.query'

@ApiTags('Geo')
@Controller(RouteNames.GEO.value)
export class GeoController {
	constructor(private queryBus: QueryBus) {}

	@Get(RouteNames.GEO.COUNTRIES.value)
	@RouteDecorators(geoRoutesConfig.getCountries)
	async getCountries(): Promise<undefined | SWGetCountriesRouteOut> {
		try {
			const res = await this.queryBus.execute<
				any,
				ReturnType<typeof GetCountriesHandler.prototype.execute>
			>(new GetCountriesQuery())

			return createSuccessResp(geoRoutesConfig.getCountries, res)
		} catch (err: any) {
			console.log(err)
			createFailResp(geoRoutesConfig.getCountries, err)
		}
	}

	@Get(
		[
			RouteNames.GEO.COUNTRIES.value,
			':countryCode',
			RouteNames.GEO.COUNTRIES.COUNTRY_ID('').CITIES.value,
		].join('/'),
	)
	@RouteDecorators(geoRoutesConfig.getCountryCities)
	@ApiQuery({
		name: 'searchNameTerm',
		required: false,
		type: String,
		description: 'Filter city name by first characters',
	})
	@ApiQuery({
		name: 'pageNumber',
		required: false,
		type: Number,
		description: 'Page number',
		example: 1,
	})
	@ApiQuery({
		name: 'pageSize',
		required: false,
		type: Number,
		description: 'Count of cities',
		example: 10,
	})
	async getCountryCities(
		@Query(new GetCountryCitiesQueriesPipe()) query: GetCountryCitiesQueries,
		@Param('countryCode') countryCode: string,
	): Promise<undefined | SWGetCountryCitiesRouteOut> {
		try {
			const res = await this.queryBus.execute<
				any,
				ReturnType<typeof GetCountryCitiesHandler.prototype.execute>
			>(new GetCountryCitiesQuery(countryCode, query))

			return createSuccessResp(geoRoutesConfig.getCountryCities, res)
		} catch (err: any) {
			createFailResp(geoRoutesConfig.getCountryCities, err)
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
	@RouteDecorators(geoRoutesConfig.getCity)
	async getCity(
		@Param('countryCode') countryCode: string,
		@Param('cityId') cityId: number,
	): Promise<undefined | SWGetCityRouteOut> {
		try {
			const city = await this.queryBus.execute<
				any,
				ReturnType<typeof GetCityHandler.prototype.execute>
			>(new GetCityQuery(countryCode, cityId))

			return createSuccessResp(geoRoutesConfig.getCity, city)
		} catch (err: any) {
			createFailResp(geoRoutesConfig.getCity, err)
		}
	}
}
