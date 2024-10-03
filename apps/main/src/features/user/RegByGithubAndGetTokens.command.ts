import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
const { randomBytes } = require('node:crypto')
import { GitHubService } from '../../routes/auth/gitHubService'
import { CreateUserDtoModel, OAuthProviderName } from '../../models/user/user.input.model'
import { UserRepository } from '../../repositories/user.repository'
import { CreateRefreshTokenCommand } from '../auth/CreateRefreshToken.command'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { GoogleService } from '../../routes/auth/googleService'
import { UserQueryRepository } from '../../repositories/user.queryRepository'

export class RegByProviderAndLoginCommand {
	constructor(
		public args: {
			clientIP: string
			clientName: string
			providerCode: string
			providerState: string
			providerName: OAuthProviderName
		},
	) {}
}

@CommandHandler(RegByProviderAndLoginCommand)
export class RegByProviderAndLoginHandler implements ICommandHandler<RegByProviderAndLoginCommand> {
	constructor(
		private userRepository: UserRepository,
		private userQueryRepository: UserQueryRepository,
		private commandBus: CommandBus,
		private gitHubService: GitHubService,
		private googleService: GoogleService,
	) {}

	async execute(command: RegByProviderAndLoginCommand) {
		const { providerCode, providerState, providerName, clientIP, clientName } = command.args

		let userInfo
		if (providerName === 'github') {
			userInfo = await this.gitHubService.getUserDataByOAuthCode(providerCode, providerState)
		} else if (providerName === 'google') {
			userInfo = await this.googleService.getUserDataByOAuthCode(providerCode)
		}

		if (!userInfo) {
			throw new Error(ErrorMessage.UserNotFound)
		}

		const userWithThisEmail = await this.userRepository.getUserByEmailOrName({
			email: userInfo.email,
		})
		let userId = userWithThisEmail?.id || 0

		// Add existing user a new provider id if it is GitHub
		if (userWithThisEmail && providerName === 'github' && !userWithThisEmail.githubId) {
			await this.addProviderIdToExistingUser(userWithThisEmail.id, {
				github_id: userInfo.providerId,
			})
		}
		// Add existing user a new provider id if it is Google
		else if (userWithThisEmail && providerName === 'google' && !userWithThisEmail.googleId) {
			await this.addProviderIdToExistingUser(userWithThisEmail.id, {
				google_id: userInfo.providerId,
			})
		}
		// Or create a new user
		else if (!userWithThisEmail) {
			const args: any = {
				email: userInfo.email,
				name: userInfo.name,
			}

			if (providerName === 'github') {
				args.githubId = userInfo.providerId
			} else if (providerName === 'google') {
				args.googleId = userInfo.providerId
			}

			const createdUser = await this.createNewUser(args)

			userId = createdUser.id
		}

		const refreshTokenStr = await this.commandBus.execute(
			new CreateRefreshTokenCommand(userId, clientIP, clientName),
		)

		const outUser = await this.userQueryRepository.getUserById(userId)

		return {
			refreshTokenStr,
			user: outUser!,
		}
	}

	async createNewUser(arg: {
		email: string
		name: null | string
		githubId?: number
		googleId?: number
	}) {
		const uniqueName = await this.chooseUniqueName(arg.name)
		const password = randomBytes(4).toString('hex')

		const createUserDto: CreateUserDtoModel & { githubId?: number; googleId?: number } = {
			email: arg.email,
			userName: uniqueName,
			password,
		}

		if (arg.githubId) {
			createUserDto.githubId = arg.githubId
		}
		if (arg.googleId) {
			createUserDto.googleId = arg.googleId
		}

		return await this.userRepository.createUser(createUserDto, true)
	}

	async chooseUniqueName(name: null | string): Promise<string> {
		const originName = name ?? 'user'
		let uniqueName = originName

		do {
			const user = await this.userRepository.getUserByEmailOrName({ name: uniqueName })

			if (user) {
				uniqueName = originName + randomBytes(4).toString('hex')
			} else {
				return uniqueName
			}
		} while (true)
	}

	async addProviderIdToExistingUser(
		userId: number,
		provider: {
			github_id?: number
			google_id?: number
		},
	) {
		const updater: any = {
			email_confirmation_code: null,
			is_email_confirmed: true,
			email_confirmation_code_expiration_date: null,
		}
		if (provider.github_id) {
			updater.github_id = provider.github_id
		}
		if (provider.google_id) {
			updater.google_id = provider.google_id
		}

		await this.userRepository.updateUser(userId, updater)
	}
}
