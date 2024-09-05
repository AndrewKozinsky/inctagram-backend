import { Injectable } from '@nestjs/common'

type UserMetaInfo = {
	login: string // 'AndrewKozinsky'
	id: number // 14260404
	name: null | string // 'Andrew Kozinsky'
}

type UserEmailInfo = {
	email: string // 'andkozinskiy@yandex.ru'
}

@Injectable()
export class GitHubService {
	constructor() {}

	async getUserDataByOAuthCode(code: string) {
		const accessToken = await this.getAccessToken(code)
		return await this.getUserByAccessCode(accessToken)
	}

	async getAccessToken(code: string): Promise<string> {
		const params = new URLSearchParams({
			client_id: 'Ov23lix6EdcGrBfP7Bee',
			client_secret: '7cb6f03660fc6b97b8ca6e3b296665319bbba05e',
			code,
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

	async getUserByAccessCode(accessToken: string) {
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
			githubId: userMetaInfo.id,
			githubLogin: userMetaInfo.login,
			githubName: userMetaInfo.name,
			githubEmail: userEmailInfo.email,
		}
	}
}
