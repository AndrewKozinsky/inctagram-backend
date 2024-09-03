export enum SuccessCode {
	Ok = '200',
	Created_201 = '201',
}

export enum ErrorCode {
	NotFound_404 = '404',
	Unauthorized_401 = '401',
	BadRequest_400 = '400',
	Forbidden_403 = '403',
}

export enum ErrorMessage {
	EmailOrUsernameIsAlreadyRegistered = 'Email or username is already registered',
	EmailConfirmationCodeIsExpired = 'Email confirmation code is expired',
	EmailConfirmationCodeNotFound = 'Email confirmation code not found',
	EmailOrPasswordDoNotMatch = 'Email or passwords do not match',
	EmailIsNotConfirmed = 'Email is not confirmed',
	EmailNotFound = 'Email not found',
	UserNotFound = 'User not found',
	RefreshTokenIsNotValid = 'Refresh token is not valid',
}
