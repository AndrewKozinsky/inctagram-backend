import { INestApplication, INestMicroservice } from '@nestjs/common'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import {
	checkErrorResponse,
	checkSuccessResponse,
	deleteRequest,
	getRequest,
	postRequest,
	defUserEmail,
	defUserName,
	defUserPassword,
} from './utils/common'
import RouteNames from '../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../src/utils/httpStatuses'
import { clearAllDB } from './utils/db'
import { EmailAdapterService } from '@app/email-adapter'
import { UserRepository } from '../src/repositories/user.repository'
import { GitHubService } from '../src/routes/auth/gitHubService'
import { GoogleService } from '../src/routes/auth/googleService'
import { DevicesRepository } from '../src/repositories/devices.repository'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { createMainApp } from './utils/createMainApp'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let mainApp: INestApplication = 1 as any

	let emailAdapter: EmailAdapterService
	let gitHubService: GitHubService
	let googleService: GoogleService
	let reCaptchaAdapter: ReCaptchaAdapterService
	let userRepository: UserRepository
	let securityRepository: DevicesRepository
	let jwtService: JwtAdapterService
	let mainConfig: MainConfigService

	beforeAll(async () => {
		const createMainAppRes = await createMainApp(
			emailAdapter,
			gitHubService,
			googleService,
			reCaptchaAdapter,
		)

		mainApp = createMainAppRes.mainApp

		emailAdapter = createMainAppRes.emailAdapter
		gitHubService = createMainAppRes.gitHubService
		googleService = createMainAppRes.googleService
		reCaptchaAdapter = createMainAppRes.reCaptchaAdapter

		userRepository = await mainApp.resolve(UserRepository)
		securityRepository = await mainApp.resolve(DevicesRepository)
		jwtService = await mainApp.resolve(JwtAdapterService)
		mainConfig = await mainApp.resolve(MainConfigService)
	})

	beforeEach(async () => {
		await clearAllDB(mainApp)
	})

	afterEach(async () => {
		jest.clearAllMocks()
	})

	describe('Get all countries', () => {
		it('should return status 200 and a list of all countries', async () => {
			const getCountriesRes = await getRequest(mainApp, RouteNames.GEO.COUNTRIES.full).expect(
				HTTP_STATUSES.OK_200,
			)

			const countriesRes = getCountriesRes.body
			checkSuccessResponse(countriesRes, 200)
			expect(countriesRes.data.countries.length).toBeGreaterThan(200)
			expect(typeof countriesRes.data.countries[0].code).toBe('string')
			expect(typeof countriesRes.data.countries[0].name).toBe('string')
		})
	})

	describe('Get country cities', () => {
		it('should return status 200 and a default list of cities', async () => {
			const getCitiesRes = await getRequest(
				mainApp,
				RouteNames.GEO.COUNTRIES.COUNTRY_ID('ru').CITIES.full,
			).expect(HTTP_STATUSES.OK_200)

			const citiesRes = getCitiesRes.body
			checkSuccessResponse(citiesRes, 200)
			expect(citiesRes.data.cities.length).toBe(10)
			expect(typeof citiesRes.data.cities[0].id).toBe('number')
			expect(typeof citiesRes.data.cities[0].name).toBe('string')
		})

		it('should return status 200 and 20 cities starts with "mo"', async () => {
			const getCitiesRes = await getRequest(
				mainApp,
				RouteNames.GEO.COUNTRIES.COUNTRY_ID('ru').CITIES.full +
					'?searchNameTerm=mo&pageNumber=2&pageSize=20',
			).expect(HTTP_STATUSES.OK_200)

			const citiesRes = getCitiesRes.body
			checkSuccessResponse(citiesRes, 200)
			expect(citiesRes.data.cities.length).toBe(20)
			console.log(citiesRes.data.cities[0])
			expect(citiesRes.data.cities[0].name).toBe('Monchegorsk')
			expect(citiesRes.data.cities[19].name).toBe('Moshkovskiy Rayon')
		})
	})

	describe('Get country city', () => {
		it('should return status 200 and a default list of cities', async () => {
			const getCityRes = await getRequest(
				mainApp,
				RouteNames.GEO.COUNTRIES.COUNTRY_ID('ru').CITIES.CITY_ID('ru', '99957').full,
			).expect(HTTP_STATUSES.OK_200)

			const cityRes = getCityRes.body
			checkSuccessResponse(cityRes, 200)
			expect(cityRes.data.id).toBe(99957)
			expect(cityRes.data.name).toBe('Monchegorsk')
		})
	})
})
