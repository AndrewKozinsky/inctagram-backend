type LayerResult<T, M> = {
	data: T
	meta: M
}

export enum LayerErrorCode {
	NotFound_404 = 'NotFound_404',
	Unauthorized_401 = 'Unauthorized_401',
	BadRequest_400 = 'BadRequest_400',
	Forbidden_403 = 'Forbidden_403',
}
