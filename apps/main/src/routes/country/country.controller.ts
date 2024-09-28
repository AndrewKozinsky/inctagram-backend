import { Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import RouteNames from '../routesConfig/routeNames'
import { ApiTags } from '@nestjs/swagger'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { routesConfig } from '../routesConfig/routesConfig'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import {
	GenerateAllCountriesAndCitiesCommand,
	GenerateAllCountriesAndCitiesHandler,
} from '../../features/countries/GenerateAllCountriesAndCities.command'

@ApiTags('Auth')
@Controller(RouteNames.COUNTRIES.value)
export class CountryController {
	constructor(private commandBus: CommandBus) {}

	// Generate all countries and cities
	@Post(RouteNames.COUNTRIES.ALL.value)
	@RouteDecorators(routesConfig.registration)
	async generateAllCountriesAndCities(): Promise<undefined | SWEmptyRouteOut> {
		try {
			await this.commandBus.execute<
				any,
				ReturnType<typeof GenerateAllCountriesAndCitiesHandler.prototype.execute>
			>(new GenerateAllCountriesAndCitiesCommand())

			return createSuccessResp(routesConfig.generateAllCountriesAndCities, null)
		} catch (err: any) {
			createFailResp(routesConfig.generateAllCountriesAndCities, err)
		}
	}
}
