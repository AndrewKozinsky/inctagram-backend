import { Injectable } from '@nestjs/common'
import { UserInfoFromProvider } from './gitHubService'
import { MainConfigService } from '@app/config'

type UserInfo = {
	resourceName: string // 'people/108179069609078490986'
	names: {
		metadata: [Object]
		displayName: string // 'Andrew K'
		familyName: string // 'K'
		givenName: string // 'Andrew'
	}[]
	emailAddresses: {
		metadata: {
			primary: boolean // true
			verified: boolean // true
			source: {
				type: string // 'ACCOUNT'
				id: string // '108179069609078490986'
			}
			sourcePrimary: boolean // true
		}
		value: string // 'andkozinskiy@yandex.ru'
	}[]
}

@Injectable()
export class GoogleService {
	constructor(private mainConfig: MainConfigService) {}

	async getUserDataByOAuthCode(code: string) {
		const accessToken = await this.getAccessToken(code)
		return await this.getUserByAccessCode(accessToken)
	}

	async getAccessToken(code: string): Promise<string> {
		const params = new URLSearchParams({
			client_id: this.mainConfig.get().oauth.google.clientId,
			client_secret: this.mainConfig.get().oauth.google.clientId,
			code,
			grant_type: 'authorization_code',
			redirect_uri: 'http://localhost:3000/api/v1/auth/registration/google',
		}).toString()

		const myHeaders = new Headers()
		myHeaders.append('Accept', 'application/json')
		myHeaders.append('Accept-Encoding', 'application/json')

		return await new Promise((resolve, reject) => {
			fetch(`https://oauth2.googleapis.com/token?${params}`, {
				method: 'POST',
				headers: myHeaders,
			})
				.then((res) => res.json())
				.then((data) => {
					resolve(data.access_token)
					/*
					* {
					  access_token: 'ya29.a0AcM612x4GYgUnfcJz_L6TA5i0SGgEdiC5rH-H_9gwAdh0ivVGtZGjlsKc9aaodH0fw3c-520tSav6fL64dqB15_7jAercR0MsWEW1T0nZyi_IzKXs5FXDPzVXjonkw6QTIFgw3KQdVY4gfFCYn_BUCMVvcVbEn3E1j0FrcqTaCgYKAcoSARESFQHGX2MiTOL0iaIf3ImKTH-osEmPkQ0175',
					  expires_in: 3599,
					  scope: 'openid https://www.googleapis.com/auth/userinfo.email',
					  token_type: 'Bearer',
					  id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyZjgwYzYzNDYwMGVkMTMwNzIxMDFhOGI0MjIwNDQzNDMzZGIyODIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3OTI1NDYyNDkxMDYtdTVvZjU1ams0aHVzNjM1a3BkOTM2ZzU5NjhiNjJhMWMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3OTI1NDYyNDkxMDYtdTVvZjU1ams0aHVzNjM1a3BkOTM2ZzU5NjhiNjJhMWMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgxNzkwNjk2MDkwNzg0OTA5ODYiLCJlbWFpbCI6ImFuZGtvemluc2tpeUB5YW5kZXgucnUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImdKQVEyRjZoS3Fscm9USENJb1hwMGciLCJpYXQiOjE3MjU1Mjc4ODMsImV4cCI6MTcyNTUzMTQ4M30.qWIyh7MrXEAJT_ryeFzUdvxjZhp0Kt3-uneBdbGAguVf3JLdCubXZoFTW1md1gWJSnFd29Wz8ZHc_mvfwxeGZfn21XC8zcHXXrAk44BonVaIwK2oJuMwr-CPsdJfB_mL_UMBWF8dmYm1RniZjhJ8ts7A6L6WNDrbUOod7fw5rzXfrOsghmj_l3i7dNd-zV4N-UpLi0gYGGkXjCSiBwUNghTTcmRcsYzERmFAdWIgSgn2Pup9qsHoy-kZytJ2HDPHBgdz7jS6Usb_tDLh6roT7yXD5rxKvPclupx8m02m45Bx08KwiPafjKFDfwPoUvIo7z3d_O439XyBQ54nBo3iYg'
					}
					*/
				})
		})
	}

	async getUserByAccessCode(accessToken: string): Promise<UserInfoFromProvider> {
		const myHeaders = new Headers()
		myHeaders.append('Authorization', 'Bearer ' + accessToken)

		const userInfo: UserInfo = await new Promise((resolve, reject) => {
			fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', {
				headers: myHeaders,
			})
				.then((res) => res.json())
				.then((data) => {
					resolve(data)
					/*
					{
					  resourceName: 'people/108179069609078490986',
					  etag: '%EgcBAgkuNz0+GgQBAgUH',
					  names: [
						{
						  metadata: [Object],
						  displayName: 'Andrew K',
						  familyName: 'K',
						  givenName: 'Andrew',
						  displayNameLastFirst: 'K, Andrew',
						  unstructuredName: 'Andrew K'
						}
					  ],
					  emailAddresses: [ { metadata: [Object], value: 'andkozinskiy@yandex.ru' } ]
					}
					*/
				})
		})

		return {
			providerId: parseInt(userInfo.emailAddresses[0].metadata.source.id),
			name: userInfo.names[0].displayName,
			email: userInfo.emailAddresses[0].value,
		}
	}
}
