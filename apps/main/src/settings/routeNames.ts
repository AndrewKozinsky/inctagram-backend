export const RouteNames = {
	AUTH: {
		value: 'auth',
		LOGIN: {
			value: 'login',
			full: 'auth/login',
		},
		/*REFRESH_TOKEN: {
			value: 'refresh-token',
			full: 'auth/refresh-token',
		},*/
		REGISTRATION: {
			value: 'registration',
			full: 'auth/registration',
		},
		REGISTRATION_EMAIL_RESENDING: {
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
}

export default RouteNames
