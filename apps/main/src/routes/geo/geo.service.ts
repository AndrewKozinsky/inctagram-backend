import { Injectable } from '@nestjs/common'
import { MainConfigService } from '@app/config'
import { Response } from 'express'
import { GetCountryCitiesQueries } from '../../models/geo/geo.input.model'

type CountryFull = {
	id: number // 100,
	name: string // 'Iceland',
	iso2: string // 'IS',
	iso3: string // 'ISL'
	phonecode: string // '354'
	capital: string // 'Reykjavik'
	currency: string // 'ISK'
	native: string // 'Ísland'
	emoji: string // '🇮🇸'
}

type Country = {
	code: string // 'IS',
	name: string // 'Iceland',
}

type City = {
	id: number // 57584,
	name: string // 'Abhaneri',
}

let countriesCache: { code: string; name: string }[] = []
const citiesCache: { [countryCode: string]: { id: number; name: string }[] } = {}

@Injectable()
export class GeoService {
	constructor(private mainConfig: MainConfigService) {}

	async fetchCountriesAndCache() {
		const { apiKey } = this.mainConfig.get().countryStateCity

		const headers = new Headers()
		headers.append('X-CSCAPI-KEY', apiKey)

		const bufferRes = await fetch('https://api.countrystatecity.in/v1/countries', {
			method: 'GET',
			headers,
			redirect: 'follow',
		})

		const countries: CountryFull[] = await bufferRes.json()

		countriesCache = countries.map((country) => {
			return {
				code: country.iso2,
				name: country.name,
			}
		})
	}

	async fetchCountryCitiesAndCache(countryCode: string) {
		const { apiKey } = this.mainConfig.get().countryStateCity

		const headers = new Headers()
		headers.append('X-CSCAPI-KEY', apiKey)

		const bufferRes = await fetch(
			`https://api.countrystatecity.in/v1/countries/${countryCode}/cities`,
			{
				method: 'GET',
				headers,
				redirect: 'follow',
			},
		)
		const cities: City[] = await bufferRes.json()

		citiesCache[countryCode] = cities.map((city) => {
			return {
				id: city.id,
				name: city.name,
			}
		})
	}

	async getAllCountries() {
		if (!countriesCache.length) {
			await this.fetchCountriesAndCache()
		}

		return { countries: countriesCache }
	}

	async getCountryCities(countryCode: string, query: GetCountryCitiesQueries) {
		if (!citiesCache[countryCode]) {
			await this.fetchCountryCitiesAndCache(countryCode)
		}

		const cities = citiesCache[countryCode]
		if (!cities) {
			return {
				cities: [],
				total: 0,
			}
		}

		const { searchNameTerm = '', pageSize = 10, pageNumber = 1 } = query

		const citiesFilteredByName = cities.filter((city) =>
			city.name.toLowerCase().startsWith(searchNameTerm.toLowerCase()),
		)

		const citiesOnPage = citiesFilteredByName.splice((pageNumber - 1) * pageSize, pageSize)

		return {
			cities: citiesOnPage,
			total: citiesFilteredByName.length,
		}
	}

	async getCityById(countryCode: string, cityId: number) {
		if (!citiesCache[countryCode]) {
			await this.fetchCountryCitiesAndCache(countryCode)
		}

		const cities = citiesCache[countryCode]
		if (!cities) {
			return null
		}

		const city = cities.find((city) => city.id === cityId)
		return city ? city : null
	}
}
