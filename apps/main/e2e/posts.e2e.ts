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
	mockFilesServiceSendMethodOnce,
} from './utils/common'
import RouteNames from '../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../src/utils/httpStatuses'
import { clearAllDB } from './utils/db'
import { EmailAdapterService } from '@app/email-adapter'
import { UserRepository } from '../src/repositories/user.repository'
import { userUtils } from './utils/userUtils'
import {
	FileMS_GetPostPhotosOutContract,
	FileMS_GetUserAvatarOutContract,
	FileMS_GetUsersAvatarsOutContract,
	FileMS_SavePostPhotoOutContract,
	parseCookieStringToObj,
} from '@app/shared'
import { GitHubService } from '../src/routes/auth/gitHubService'
import { GoogleService } from '../src/routes/auth/googleService'
import { DevicesRepository } from '../src/repositories/devices.repository'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { createMainApp } from './utils/createMainApp'
import { ClientProxy } from '@nestjs/microservices'
import { postUtils } from './utils/postUtils'
import { of } from 'rxjs'

it('123', async () => {
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

	describe('Add a post photo', () => {
		it('should return 400 if wrong files were send', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				avatarUrl: null,
			} as FileMS_GetUserAvatarOutContract)

			// Send large file
			const bigFilePath = path.join(__dirname, 'utils/files/big-avatar.png')

			const addPostPhotoRes1 = await postRequest(mainApp, RouteNames.POSTS.PHOTOS.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Content-Type', 'multipart/form-data')
				.attach('postPhotoFile', bigFilePath)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			checkErrorResponse(addPostPhotoRes1.body, 400, 'File is too large')

			// Send file in invalid format
			const textFilePath = path.join(__dirname, 'utils/files/text.txt')

			const addPostPhotoRes2 = await postRequest(mainApp, RouteNames.POSTS.PHOTOS.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Content-Type', 'multipart/form-data')
				.attach('postPhotoFile', textFilePath)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			checkErrorResponse(addPostPhotoRes2.body, 400, 'File has wrong mime type')
		})

		it('should return 200 if send correct file', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				photoId: 'somePostPhotoId',
			} satisfies FileMS_SavePostPhotoOutContract)

			const photoFilePath = path.join(__dirname, 'utils/files/avatar.png')

			const addPostPhotoRes = await postRequest(mainApp, RouteNames.POSTS.PHOTOS.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Content-Type', 'multipart/form-data')
				.attach('postPhotoFile', photoFilePath)
				.expect(HTTP_STATUSES.CREATED_201)

			// { status: 'success', code: 201, data: { photoId: 'somePostPhotoId' } }
			const addPostPhoto = addPostPhotoRes.body

			checkSuccessResponse(addPostPhoto, 201, { photoId: 'somePostPhotoId' })
		})
	})

	describe('Add a post photo', () => {
		it('should return 200 if post photo is exists and was deleted', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			;(filesMicroservice.send as jest.Mock)
				.mockImplementation(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of({
						photoId: 'somePostPhotoId',
					} satisfies FileMS_SavePostPhotoOutContract)
				})

			const photoFilePath = path.join(__dirname, 'utils/files/avatar.png')

			const addPostPhotoRes = await postRequest(mainApp, RouteNames.POSTS.PHOTOS.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Content-Type', 'multipart/form-data')
				.attach('postPhotoFile', photoFilePath)
				.expect(HTTP_STATUSES.CREATED_201)

			// { status: 'success', code: 201, data: { photoId: 'somePostPhotoId' } }
			const addPostPhoto = addPostPhotoRes.body

			await deleteRequest(mainApp, RouteNames.POSTS.PHOTOS.PHOTO(addPostPhoto.photoId).full)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)
		})
	})

	describe('Add a new post', () => {
		it('should return 400 if the accessToken inside cookie is valid, but request body is not send', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				avatarUrl: null,
			} as FileMS_GetUserAvatarOutContract)

			const addPostRes = await postRequest(mainApp, RouteNames.POSTS.value)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const addPost = addPostRes.body

			checkErrorResponse(addPost, 400, 'Wrong body')
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

			;(filesMicroservice.send as jest.Mock)
				.mockImplementation(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of([
						{
							id: '1',
							url: 'url-1',
						},
						{
							id: '2',
							url: 'url-2',
						},
					] satisfies FileMS_GetPostPhotosOutContract)
				})

			const addPostRes = await postRequest(mainApp, RouteNames.POSTS.value)
				.set('authorization', 'Bearer ' + accessToken)
				.send({
					text: 'Post description',
					location: 'Photo location',
					photosIds: ['1', '2'],
				})
				.expect(HTTP_STATUSES.CREATED_201)

			const expectedRes = {
				id: 1,
				text: 'Post description',
				location: 'Photo location',
				userId: 1,
				photos: [
					{ id: '1', url: 'url-1' },
					{ id: '2', url: 'url-2' },
				],
			}

			checkSuccessResponse(addPostRes.body, 201, expectedRes)
		})
	})

	describe('Get a post', () => {
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
			for (let i = 1; i < 3; i++) {
				;(filesMicroservice.send as jest.Mock)
					.mockImplementation(() => {
						return of({
							avatarUrl: null,
						} as FileMS_GetUserAvatarOutContract)
					})
					.mockImplementation(() => {
						return of([
							{
								id: '1',
								url: 'url-1',
							},
							{
								id: '2',
								url: 'url-2',
							},
						] satisfies FileMS_GetPostPhotosOutContract)
					})

				const addPost = await postUtils.createPost({
					mainApp,
					accessToken,
				})

				if (i === 2) {
					secondPostId = addPost.data.id
				}
			}

			const getPostRes = await getRequest(mainApp, RouteNames.POSTS.POST(secondPostId).full)
			const getPost = getPostRes.body

			const expectedRes = {
				id: 2,
				text: 'Post description',
				location: 'Photo location',
				userId: 1,
				photos: [
					{
						id: '1',
						url: 'url-1',
					},
					{
						id: '2',
						url: 'url-2',
					},
				],
			}

			checkSuccessResponse(getPost, 200, expectedRes)
		})
	})

	describe('Update post', () => {
		it('should return 404 if the auth data is valid, but there is not a post with passed id', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				avatarUrl: null,
			} as FileMS_GetUserAvatarOutContract)

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

			;(filesMicroservice.send as jest.Mock)
				.mockImplementation(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of([
						{
							id: '1',
							url: 'url-1',
						},
						{
							id: '2',
							url: 'url-2',
						},
					] satisfies FileMS_GetPostPhotosOutContract)
				})

			const addPost = await postUtils.createPost({
				mainApp,
				accessToken,
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

			;(filesMicroservice.send as jest.Mock)
				.mockImplementationOnce(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of([
						{
							id: '1',
							url: 'url-1',
						},
						{
							id: '2',
							url: 'url-2',
						},
					] satisfies FileMS_GetPostPhotosOutContract)
				})

			const addPost = await postUtils.createPost({
				mainApp,
				accessToken: accessToken1,
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

			;(filesMicroservice.send as jest.Mock)
				.mockImplementationOnce(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of([
						{
							id: '1',
							url: 'url-1',
						},
						{
							id: '2',
							url: 'url-2',
						},
					] satisfies FileMS_GetPostPhotosOutContract)
				})

			const updatePostRes = await patchRequest(mainApp, RouteNames.POSTS.POST(postId).full)
				.set('authorization', 'Bearer ' + accessToken2)
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

			;(filesMicroservice.send as jest.Mock)
				.mockImplementationOnce(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of([
						{
							id: '1',
							url: 'url-1',
						},
						{
							id: '2',
							url: 'url-2',
						},
					] satisfies FileMS_GetPostPhotosOutContract)
				})

			const addPost = await postUtils.createPost({
				mainApp,
				accessToken,
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
					{ id: '1', url: 'url-1' },
					{ id: '2', url: 'url-2' },
				],
			}

			checkSuccessResponse(updatePost, 200, expectedRes)

			const getPostRes = await getRequest(mainApp, RouteNames.POSTS.POST(postId).full)
			checkSuccessResponse(getPostRes.body, 200, expectedRes)
		})
	})

	describe('Delete post', () => {
		it('should return 404 if the auth data is valid, but there is not a post with passed id', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			mockFilesServiceSendMethod(filesMicroservice, {
				avatarUrl: null,
			} as FileMS_GetUserAvatarOutContract)

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

			;(filesMicroservice.send as jest.Mock)
				.mockImplementationOnce(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of([
						{
							id: '1',
							url: 'url-1',
						},
						{
							id: '2',
							url: 'url-2',
						},
					] satisfies FileMS_GetPostPhotosOutContract)
				})

			const addPost = await postUtils.createPost({
				mainApp,
				accessToken: accessToken1,
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

			;(filesMicroservice.send as jest.Mock)
				.mockImplementationOnce(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of([
						{
							id: '1',
							url: 'url-1',
						},
						{
							id: '2',
							url: 'url-2',
						},
					] satisfies FileMS_GetPostPhotosOutContract)
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

			;(filesMicroservice.send as jest.Mock)
				.mockImplementationOnce(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of([
						{
							id: '1',
							url: 'url-1',
						},
						{
							id: '2',
							url: 'url-2',
						},
					] satisfies FileMS_GetPostPhotosOutContract)
				})

			const addPost = await postUtils.createPost({
				mainApp,
				accessToken,
			})
			const postId = addPost.data.id

			;(filesMicroservice.send as jest.Mock)
				.mockImplementationOnce(() => {
					return of({
						avatarUrl: null,
					} as FileMS_GetUserAvatarOutContract)
				})
				.mockImplementation(() => {
					return of([
						{
							id: '1',
							url: 'url-1',
						},
						{
							id: '2',
							url: 'url-2',
						},
					] satisfies FileMS_GetPostPhotosOutContract)
				})

			const deletePostRes = await deleteRequest(mainApp, RouteNames.POSTS.POST(postId).full)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			const deletePost = deletePostRes.body
			checkSuccessResponse(deletePost, 200, null)
		})
	})
})
