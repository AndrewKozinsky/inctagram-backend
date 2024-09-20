import { Injectable } from '@nestjs/common'
import { MainConfigService } from '@app/config'
import { Response } from 'express'

@Injectable()
export class CountryService {
	constructor(private mainConfig: MainConfigService) {}

	getCountriesList() {
		return {
			Russia: ['Orenburg', 'Moscow'],
		}
	}
}
