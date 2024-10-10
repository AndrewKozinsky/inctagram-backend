import { v4 as uuid } from 'uuid'

export function createUniqString() {
	return uuid()
}

type CookieObj = {
	cookieName: string
	cookieValue: string
	'Max-Age': number
	Path: string
	Expires: string
	HttpOnly: boolean
	Secure: boolean
}
/**
 * Get string like
 * 'refreshToken=eyJhbGciOiJIU; Max-Age=20; Path=/; Expires=Thu, 01 Feb 2024 09:59:53 GMT; HttpOnly; Secure'
 * and makes it into
 * {
 * 		cookieName: 'refreshToken',
 * 		cookieValue: 'eyJhbGciOiJIU',
 * 		'Max-Age': 20,
 * 		Path: '/',
 * 		Expires: 'Thu, 01 Feb 2024 09:59:53 GMT',
 * 		HttpOnly: true,
 * 		Secure: true,
 * 	}
 * @param cookieString
 */
export function parseCookieStringToObj(cookieString: string) {
	const cookieParts = cookieString.split('; ')

	const resultObj: CookieObj = {
		cookieName: '',
		cookieValue: '',
		'Max-Age': 0,
		Path: '',
		Expires: '',
		HttpOnly: false,
		Secure: false,
	}

	for (let i = 0; i < cookieParts.length; i++) {
		const nameAndValueArr = cookieParts[i].split('=')

		if (i === 0) {
			resultObj.cookieName = nameAndValueArr[0]
			resultObj.cookieValue = nameAndValueArr[1]
			continue
		}

		if (nameAndValueArr.length === 2) {
			const value = +nameAndValueArr[1] ? +nameAndValueArr[1] : nameAndValueArr[1]

			// @ts-ignore
			resultObj[nameAndValueArr[0]] = value
		} else {
			// @ts-ignore
			resultObj[nameAndValueArr[0]] = true
		}
	}

	return resultObj
}
