export type UserServiceModel = {
	id: number
	email: string
	userName: string | null
	avatar: string | null
	hashedPassword: string
	emailConfirmationCode: string | null
	confirmationCodeExpirationDate: string | null
	isEmailConfirmed: boolean
	passwordRecoveryCode: string | null
	githubId: number | null
	googleId: number | null
}
