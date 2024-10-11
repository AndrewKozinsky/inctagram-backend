import { Injectable } from '@nestjs/common'
import { MainConfigService } from '@app/config'

type UserMetaInfo =
	| {
			login: string // 'AndrewKozinsky'
			id: string // 14260404
			name: null | string // 'Andrew Kozinsky'
	  }
	| {
			message: string // 'Bad credentials'
			status: string // '401'
	  }

type UserEmailInfo = {
	email: string // 'andkozinskiy@yandex.ru'
}

export type UserInfoFromProvider = {
	providerId: string
	userName: null | string
	email: string
}

@Injectable()
export class GitHubService {
	constructor(private mainConfig: MainConfigService) {}

	async getUserDataByOAuthCode(
		clientHostName: string,
		code: string,
	): Promise<UserInfoFromProvider | null> {
		const accessToken = await this.getAccessToken(clientHostName, code)
		if (!accessToken) return null

		return await this.getUserByAccessCode(accessToken)
	}

	async getAccessToken(clientHostName: string, code: string): Promise<string> {
		const client_id = clientHostName.startsWith('localhost')
			? this.mainConfig.get().oauth.githubLocalToLocal.clientId
			: this.mainConfig.get().oauth.githubProdToProd.clientId

		const client_secret = clientHostName.startsWith('localhost')
			? this.mainConfig.get().oauth.githubLocalToLocal.clientSecret
			: this.mainConfig.get().oauth.githubProdToProd.clientSecret

		const params = new URLSearchParams({
			client_id,
			client_secret,
			code,
		}).toString()

		const headers = new Headers()
		headers.append('Accept', 'application/json')
		headers.append('Accept-Encoding', 'application/json')

		return await new Promise((resolve, reject) => {
			fetch(`https://github.com/login/oauth/access_token?${params}`, {
				method: 'GET',
				headers,
			})
				.then((res) => res.json())
				.then((data) => {
					resolve(data.access_token)
				})
		})
	}

	async getUserByAccessCode(accessToken: string): Promise<null | UserInfoFromProvider> {
		const myHeaders = new Headers()
		myHeaders.append('Authorization', 'Bearer ' + accessToken)

		const userMetaInfo: UserMetaInfo = await new Promise((resolve, reject) => {
			fetch('https://api.github.com/user', {
				headers: myHeaders,
			})
				.then((res) => res.json())
				.then((data) => {
					resolve(data)
				})
		})

		if ('status' in userMetaInfo && userMetaInfo.status === '401') {
			return null
		}

		if ('status' in userMetaInfo && 'message' in userMetaInfo) {
			return null
		}

		const userEmailInfo: UserEmailInfo = await new Promise((resolve, reject) => {
			fetch('https://api.github.com/user/emails', {
				headers: myHeaders,
			})
				.then((res) => res.json())
				.then((data) => {
					resolve(data[0])
				})
		})

		return {
			providerId: userMetaInfo.id.toString(),
			userName: userMetaInfo.name,
			email: userEmailInfo.email,
		}
	}
}
