export function CustomException(errCode: string, errMessage: string = '') {
	return new Error(JSON.stringify({ code: errCode, message: errMessage }))
}
