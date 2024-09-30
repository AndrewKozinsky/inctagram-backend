import { SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'
import { SWGetCityRouteOut, SWGetCountriesRouteOut } from './swaggerTypes'

export const geoRoutesConfig = {
	getCountries: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Countries list',
				dataClass: SWGetCountriesRouteOut,
			},
		],
	},
	getCountryCities: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Country cities list',
				dataClass: SWGetCountriesRouteOut,
			},
		],
	},
	getCity: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'City information',
				dataClass: SWGetCityRouteOut,
			},
		],
	},
} satisfies RoutesConfig.Root
