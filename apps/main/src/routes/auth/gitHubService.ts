import { Injectable } from '@nestjs/common'
import { MainConfigService } from '@app/config'

type UserMetaInfo =
	| {
			login: string // 'AndrewKozinsky'
			id: number // 14260404
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
	providerId: number
	name: null | string
	email: string
}

@Injectable()
export class GitHubService {
	constructor(private mainConfig: MainConfigService) {}

	async getUserDataByOAuthCode(code: string, state: string) {
		const accessToken = await this.getAccessToken(code, state)
		if (!accessToken) return null

		return await this.getUserByAccessCode(accessToken)
	}

	async getAccessToken(code: string, state: string): Promise<string> {
		const params = new URLSearchParams({
			client_id: this.mainConfig.get().oauth.github.clientId,
			client_secret: this.mainConfig.get().oauth.github.clientSecret,
			code,
			state,
		}).toString()

		const myHeaders = new Headers()
		myHeaders.append('Accept', 'application/json')
		myHeaders.append('Accept-Encoding', 'application/json')

		return await new Promise((resolve, reject) => {
			fetch(`https://github.com/login/oauth/access_token?${params}`, {
				method: 'GET',
				headers: myHeaders,
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
			providerId: userMetaInfo.id,
			name: userMetaInfo.name,
			email: userEmailInfo.email,
		}
	}
}
