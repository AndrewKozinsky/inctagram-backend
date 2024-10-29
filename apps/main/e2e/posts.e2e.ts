import { INestApplication } from '@nestjs/common'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import path from 'node:path'
import {
	checkErrorResponse,
	checkSuccessResponse,
	deleteRequest,
	getRequest,
	postRequest,
	defUserEmail,
	defUserName,
	defUserPassword,
	patchRequest,
	mockFilesServiceSendMethod,
	resetMockFilesServiceSendMethod,
} from './utils/common'
import RouteNames from '../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../src/utils/httpStatuses'
import { clearAllDB } from './utils/db'
import { EmailAdapterService } from '@app/email-adapter'
import { UserRepository } from '../src/repositories/user.repository'
import { userUtils } from './utils/userUtils'
import { parseCookieStringToObj } from '@app/shared'
import { GitHubService } from '../src/routes/auth/gitHubService'
import { GoogleService } from '../src/routes/auth/googleService'
import { DevicesRepository } from '../src/repositories/devices.repository'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { createMainApp } from './utils/createMainApp'
import { ClientProxy } from '@nestjs/microservices'
import { postUtils } from './utils/postUtils'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Posts (e2e)', () => {
	let mainApp: INestApplication

	let emailAdapter: EmailAdapterService
	let gitHubService: GitHubService
	let googleService: GoogleService
	let reCaptchaAdapter: ReCaptchaAdapterService
	let filesMicroservice: ClientProxy

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
			filesMicroservice,
		)

		mainApp = createMainAppRes.mainApp

		emailAdapter = createMainAppRes.emailAdapter
		gitHubService = createMainAppRes.gitHubService
		googleService = createMainAppRes.googleService
		reCaptchaAdapter = createMainAppRes.reCaptchaAdapter
		filesMicroservice = createMainAppRes.filesMicroservice

		userRepository = await mainApp.resolve(UserRepository)
		securityRepository = await mainApp.resolve(DevicesRepository)
		jwtService = await mainApp.resolve(JwtAdapterService)
		mainConfig = await mainApp.resolve(MainConfigService)
	})

	beforeEach(async () => {
		await clearAllDB(mainApp)
	})

	afterAll(async () => {
		await clearAllDB(mainApp)
	})

	afterEach(async () => {
		jest.clearAllMocks()
	})

	it('123', async () => {
		expect(2).toBe(2)
	})

	/*describe('Add a new post', () => {
		it('should return 400 if the accessToken inside cookie is valid, but request body is not send', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			const addPostRes = await postRequest(mainApp, RouteNames.POSTS.value)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			checkErrorResponse(addPostRes.body, 400, 'Files not found')
		})

		it('should return 400 if the JWT refreshToken inside cookie is valid, but send wrong files', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			// Send large file and in invalid format
			const textFilePath = path.join(__dirname, 'utils/files/text.txt')
			const bigFilePath = path.join(__dirname, 'utils/files/big-avatar.png')

			const addPostRes = await postRequest(mainApp, RouteNames.POSTS.value)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Content-Type', 'multipart/form-data')
				.attach('photoFiles', textFilePath)
				.attach('photoFiles', bigFilePath)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			checkErrorResponse(addPostRes.body, 400, 'One of files is too large')
		})

		it('should return 200 if send correct data', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				images: ['url 1', 'url 2'],
			} satisfies FileMS_SavePostImagesOutContract)

			const avatarFilePath = path.join(__dirname, 'utils/files/avatar.png')

			const addPostRes = await postRequest(mainApp, RouteNames.POSTS.value)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Content-Type', 'multipart/form-data')
				.attach('photoFiles', avatarFilePath)
				.attach('photoFiles', avatarFilePath)
				.field('text', 'Post description')
				.field('location', 'Photo location')
				.expect(HTTP_STATUSES.CREATED_201)

			const expectedRes = {
				id: 1,
				text: 'Post description',
				location: 'Photo location',
				userId: 1,
				photos: [
					{ id: 1, url: 'url 1' },
					{ id: 2, url: 'url 2' },
				],
			}

			checkSuccessResponse(addPostRes.body, 201, expectedRes)
		})
	})*/

	/*describe('Get a post', () => {
		it('should return 404 if there is not post with passed post id', async () => {
			await getRequest(mainApp, RouteNames.POSTS.POST(99).full).expect(
				HTTP_STATUSES.NOT_FOUNT_404,
			)
		})

		it('should return 200 if send correct data', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			let secondPostId = 0
			for (let i = 0; i < 2; i++) {
				mockFilesServiceSendMethod(filesMicroservice, {
					images: ['url 1', 'url 2'],
				} satisfies FileMS_SavePostImagesOutContract)

				const addPost = await postUtils.createPost({
					app: mainApp,
					accessToken,
					mainConfig,
				})

				if (i === 1) {
					secondPostId = addPost.data.id
				}
			}

			const getPostRes = await getRequest(mainApp, RouteNames.POSTS.POST(secondPostId).full)

			const expectedRes = {
				id: 2,
				text: 'Post description',
				location: 'Photo location',
				userId: 1,
				photos: [
					{ id: 3, url: 'url 1' },
					{ id: 4, url: 'url 2' },
				],
			}

			checkSuccessResponse(getPostRes.body, 200, expectedRes)
		})
	})*/

	/*describe('Update post', () => {
		it('should return 404 if the auth data is valid, but there is not a post with passed id', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			const updatePostRes = await patchRequest(mainApp, RouteNames.POSTS.POST(999).full)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.NOT_FOUNT_404)

			checkErrorResponse(updatePostRes.body, 404, 'Post not found')
		})

		it('should return 400 if the auth data is valid, but body is wrong', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				images: ['url 1', 'url 2'],
			} satisfies FileMS_SavePostImagesOutContract)

			const addPost = await postUtils.createPost({
				app: mainApp,
				accessToken,
				mainConfig,
			})
			const postId = addPost.data.id

			const updatePostRes = await patchRequest(mainApp, RouteNames.POSTS.POST(postId).full)
				.set('authorization', 'Bearer ' + accessToken)
				.send({
					text: '1',
					location: 2,
				})
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
			const updatePost = updatePostRes.body

			checkErrorResponse(updatePost, 400, 'Wrong body')
			expect(updatePost.wrongFields).toEqual([
				{ message: 'Location must be a string', field: 'location' },
			])
		})

		it('should return 400 if non post owner tries to update it', async () => {
			// This user will create a post
			const [accessToken1, refreshTokenStr1] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				images: ['url 1', 'url 2'],
			} satisfies FileMS_SavePostImagesOutContract)

			const addPost = await postUtils.createPost({
				app: mainApp,
				accessToken: accessToken1,
				mainConfig,
			})
			const postId = addPost.data.id

			// This user will try to edit the post
			const [accessToken2] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: 'secondUserName',
				email: 'second@mail.com',
				password: 'secondPassword',
			})

			const refreshTokenValue2 = parseCookieStringToObj(refreshTokenStr1).cookieValue

			const updatePostRes = await patchRequest(mainApp, RouteNames.POSTS.POST(postId).full)
				.set('authorization', 'Bearer ' + accessToken2)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue2)
				.send({
					text: 'My new post text',
					location: 'My new location',
				})
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
			const updatePost = updatePostRes.body

			checkErrorResponse(updatePost, 400, 'Post does not belong to the user')
		})

		it('should return 200 if send correct data', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				images: ['url 1', 'url 2'],
			} satisfies FileMS_SavePostImagesOutContract)

			const addPost = await postUtils.createPost({
				app: mainApp,
				accessToken,
				mainConfig,
			})
			const postId = addPost.data.id

			const updatePostRes = await patchRequest(mainApp, RouteNames.POSTS.POST(postId).full)
				.set('authorization', 'Bearer ' + accessToken)
				.send({
					text: 'My new post text',
					location: 'My new location',
				})
				.expect(HTTP_STATUSES.OK_200)
			const updatePost = updatePostRes.body

			const expectedRes = {
				id: 1,
				text: 'My new post text',
				location: 'My new location',
				userId: 1,
				photos: [
					{ id: 1, url: 'url 1' },
					{ id: 2, url: 'url 2' },
				],
			}

			checkSuccessResponse(updatePost, 200, expectedRes)

			const getPostRes = await getRequest(mainApp, RouteNames.POSTS.POST(postId).full)
			checkSuccessResponse(getPostRes.body, 200, expectedRes)
		})
	})*/

	/*describe('Update post', () => {
		it('should return 404 if the auth data is valid, but there is not a post with passed id', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			const deletePostRes = await deleteRequest(mainApp, RouteNames.POSTS.POST(999).full)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.NOT_FOUNT_404)

			checkErrorResponse(deletePostRes.body, 404, 'Post not found')
		})

		it('should return 400 if non post owner tries to delete it', async () => {
			// This user will create a post
			const [accessToken1, refreshTokenStr1] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				images: ['url 1', 'url 2'],
			} satisfies FileMS_SavePostImagesOutContract)

			const addPost = await postUtils.createPost({
				app: mainApp,
				accessToken: accessToken1,
				mainConfig,
			})
			const postId = addPost.data.id

			// This user will try to delete the post
			const [accessToken2] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: 'secondUserName',
				email: 'second@mail.com',
				password: 'secondPassword',
			})

			const deletePostRes = await deleteRequest(mainApp, RouteNames.POSTS.POST(postId).full)
				.set('authorization', 'Bearer ' + accessToken2)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
			const deletePost = deletePostRes.body

			checkErrorResponse(deletePost, 400, 'Post does not belong to the user')
		})

		it('should return 200 if the post owner tries to delete his post', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				images: ['url 1', 'url 2'],
			} satisfies FileMS_SavePostImagesOutContract)

			const addPost = await postUtils.createPost({
				app: mainApp,
				accessToken,
				mainConfig,
			})
			const postId = addPost.data.id

			resetMockFilesServiceSendMethod(filesMicroservice)
			// TODO
			mockFilesServiceSendMethod(filesMicroservice, [])

			const deletePostRes = await deleteRequest(mainApp, RouteNames.POSTS.POST(postId).full)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			expect(filesMicroservice.send).toBeCalledTimes(2)

			const deletePost = deletePostRes.body
			checkSuccessResponse(deletePost, 200, null)

			const getPostRes = await getRequest(mainApp, RouteNames.POSTS.POST(postId).full)
			checkErrorResponse(getPostRes.body, 404, 'Post not found')
		})
	})*/

	/*describe('Get recent posts', () => {
		it('should return an array with 4 posts', async () => {
			// Create a user which will created 3 posts
			const [accessToken1, refreshTokenStr1] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				images: ['url 1', 'url 2'],
			} satisfies FileMS_SavePostImagesOutContract)

			for (let i = 0; i < 3; i++) {
				await postUtils.createPost({
					app: mainApp,
					accessToken: accessToken1,
					mainConfig,
				})
			}

			// Create a user which will created 2 posts
			const [accessToken2, refreshTokenStr2] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: 'secondUserName',
				email: 'second@mail.com',
				password: 'secondPassword',
			})

			for (let i = 0; i < 3; i++) {
				await postUtils.createPost({
					app: mainApp,
					accessToken: accessToken2,
					mainConfig,
				})
			}

			// Get recent posts
			const getRecentPostsRes = await getRequest(mainApp, RouteNames.POSTS.RECENT.full)
			const getRecentPosts = getRecentPostsRes.body

			expect(getRecentPosts.data.length).toBe(4)
			checkSuccessResponse(getRecentPosts, 200)

			const firstPost = getRecentPosts.data[0]
			expect(firstPost.id).toBe(6)
			expect(firstPost.text).toBe('Post description')
			expect(typeof firstPost.createdAt).toBe('string')
			expect(firstPost.user.id).toBe(2)
			expect(firstPost.user.name).toBe('secondUserName')
			expect(firstPost.user.avatar).toBe(null)
			expect(firstPost.photos).toEqual([
				{ id: 12, url: 'url 2' },
				{ id: 11, url: 'url 1' },
			])
		})
	})*/
})
