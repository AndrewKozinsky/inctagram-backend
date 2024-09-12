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
	COUNTRIES: {
		value: 'countries',
		COUNTRY_ID(countryId: string) {
			return {
				value: countryId,
				full: 'countries/' + countryId,
				CITIES: {
					value: 'cities',
					COUNTRY_ID(citiesId: string) {
						return {
							value: citiesId,
							full: 'countries/' + countryId + 'cities/' + citiesId,
						}
					},
				},
			}
		},
		ALL: {
			value: 'all',
			full: 'countries/all',
		},
	},
	TESTING: {
		value: 'testing',
		ALL_DATA: {
			value: 'all-data',
			full: 'testing/all-data',
		},
	},
}

export default RouteNames
