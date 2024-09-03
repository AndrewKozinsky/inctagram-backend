export type SuccessResponse<T> = {
	status: 'success'
	code: number
	data: T
}

export type FailResponse = {
	status: 'error'
	code: number
	message: string
	wrongFields?: { field: string; message: string }[]
}
