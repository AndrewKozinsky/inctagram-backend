import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
const { randomBytes } = require('node:crypto')
import { GitHubService } from '../../routes/auth/gitHubService'
import { CreateUserDtoModel } from '../../models/user/user.input.model'
import { UserRepository } from '../../repositories/user.repository'
import { CreateRefreshTokenCommand } from '../auth/CreateRefreshToken.commandHandler'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { GoogleService } from '../../routes/auth/googleService'
import { FunctionFirstArgument } from '../../types/common'

export class RegByProviderAndGetTokensCommand {
	constructor(
		public args: {
			clientIP: string
			clientName: string
			providerCode: string
			providerName: 'github' | 'google'
		},
	) {}
}

@CommandHandler(RegByProviderAndGetTokensCommand)
export class RegByProviderAndGetTokensHandler
	implements ICommandHandler<RegByProviderAndGetTokensCommand>
{
	constructor(
		private userRepository: UserRepository,
		private readonly commandBus: CommandBus,
		private gitHubService: GitHubService,
		private googleService: GoogleService,
	) {}

	async execute(command: RegByProviderAndGetTokensCommand) {
		const { providerCode, providerName, clientIP, clientName } = command.args

		let userInfo
		if (providerName === 'github') {
			userInfo = await this.gitHubService.getUserDataByOAuthCode(providerCode)
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

		// Add existing user a new provider id
		if (userWithThisEmail) {
			if (providerName === 'github') {
				await this.addProviderIdToExistingUser(userWithThisEmail.id, {
					github_id: userInfo.providerId,
				})
			}
			if (providerName === 'google') {
				await this.addProviderIdToExistingUser(userWithThisEmail.id, {
					google_id: userInfo.providerId,
				})
			}
		}
		// Or create a new user
		else {
			const args: FunctionFirstArgument<typeof this.createNewUser> = {
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

		return {
			refreshTokenStr,
			user: userWithThisEmail,
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

		const createUserDto: CreateUserDtoModel = {
			email: arg.email,
			name: uniqueName,
			password,
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
		await this.userRepository.updateUser(userId, provider)
	}
}
