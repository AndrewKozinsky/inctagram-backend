export enum ErrorMessage {
	// EMAIL
	EmailOrUsernameIsAlreadyRegistered = 'Email or username is already registered',
	EmailConfirmationCodeIsExpired = 'Email confirmation code is expired',
	EmailConfirmationCodeNotFound = 'Email confirmation code not found',
	EmailOrPasswordDoNotMatch = 'Email or passwords do not match',
	EmailIsNotConfirmed = 'Email is not confirmed',
	EmailNotFound = 'Email not found',
	// USER
	UserNotFound = 'User not found',
	UserNameIsExists = 'User name is already exists',
	// AUTH
	RefreshTokenIsNotValid = 'Refresh token is not valid',
	AccessTokenIsNotValid = 'Access token is not valid',
	CaptchaIsWrong = 'Captcha is wrong',
	RefreshTokenIsNotFound = 'Refresh token is not found',
	UserDoesNotOwnThisDeviceToken = 'User does not own this device token',
	UserDeviceNotFound = 'User device not found',
	// FILES
	FilesNotFound = 'Files not found',
	FileNotFound = 'File not found',
	FileHasWrongMimeType = 'File has wrong mime type',
	OneOfFilesHasWrongMimeType = 'OneOfFileshas wrong mime type',
	FileIsTooLarge = 'File is too large',
	OneOfFilesIsTooLarge = 'One of files is too large',
	CannotSaveFile = 'Cannot save file',
	CannotSaveFiles = 'Cannot save files',
	// POSTS
	PostNotFound = 'Post not found',
	PostNotBelongToUser = 'Post does not belong to the user',
	// DATES
	DateIsWrong = 'Date is wrong',
}
