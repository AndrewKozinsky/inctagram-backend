export const RouteNames = {
	AUTH: {
		value: 'auth',
		LOGIN: {
			value: 'login',
			full: 'auth/login',
		},
		REFRESH_TOKEN: {
			value: 'refresh-token',
			full: 'auth/refresh-token',
		},
		REGISTRATION: {
			value: 'registration',
			full: 'auth/registration',
			BY_PROVIDER: {
				value: 'by-provider',
				full: 'auth/registration/by-provider',
			},
		},
		CONFIRM_EMAIL_RESENDING: {
			value: 'registration-email-resending',
			full: 'auth/registration-email-resending',
		},
		EMAIL_CONFIRMATION: {
			value: 'email-confirmation',
			full: 'auth/email-confirmation',
		},
		LOGOUT: {
			value: 'logout',
			full: 'auth/logout',
		},
		PASSWORD_RECOVERY: {
			value: 'password-recovery',
			full: 'auth/password-recovery',
		},
		NEW_PASSWORD: {
			value: 'new-password',
			full: 'auth/new-password',
		},
	},
	SECURITY: {
		value: 'security',
		DEVICES: {
			value: 'devices',
			full: 'security/devices',
			DEVICE_ID(deviceId: string) {
				return {
					value: deviceId,
					full: 'security/devices/' + deviceId,
				}
			},
		},
	},
	GEO: {
		value: 'geo',
		COUNTRIES: {
			value: 'countries',
			full: 'geo/countries',
			COUNTRY_ID(countryCode: string) {
				return {
					value: countryCode,
					full: 'geo/countries/' + countryCode,
					CITIES: {
						value: 'cities',
						full: 'geo/countries/' + countryCode + '/cities',
						CITY_ID(countryCode: string, cityId: string) {
							return {
								value: cityId,
								full: 'geo/countries/' + countryCode + '/cities/' + cityId,
							}
						},
					},
				}
			},
		},
	},
	TESTING: {
		value: 'testing',
		ALL_DATA: {
			value: 'all-data',
			full: 'testing/all-data',
		},
	},
	USERS: {
		value: 'users',
		ME: {
			value: 'me',
			full: 'users/me',
			AVATAR: {
				value: 'avatar',
				full: 'users/me/avatar',
			},
		},
		USER_ID(userId: number) {
			return {
				value: userId,
				full: 'users/' + userId,
				POSTS: {
					value: 'posts',
					full: 'users/' + userId + '/posts',
				},
			}
		},
		POSTS: {
			value: 'posts',
			full: 'users/posts',
		},
	},
	POSTS: {
		value: 'posts',
		RECENT: {
			value: 'recent',
			full: 'posts/recent',
		},
	},
}

export default RouteNames
