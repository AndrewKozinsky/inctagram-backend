export type UserServiceModel = {
	id: number
	email: string
	name: string | null
	hashedPassword: string
	emailConfirmationCode: string | null
	confirmationCodeExpirationDate: string | null
	isConfirmationEmailCodeConfirmed: boolean
	passwordRecoveryCode: string | null
}
