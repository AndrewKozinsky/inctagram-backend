export enum FileMS_EventNames {
	SaveUserAvatar = 'saveUserAvatar',
	GetUserAvatar = 'getUserAvatar',
	DeleteUserAvatar = 'deleteUserAvatar',
	SavePostImages = 'savePostImages',
	GetPostImages = 'getPostImages',
	DeletePostImages = 'deletePostImages',

	EraseDatabase = 'eraseDatabase',
}

export type FileMS_SaveUserAvatarInContract = {
	userId: number
	avatarFile: Express.Multer.File
}
export type FileMS_SaveUserAvatarOutContract = {
	avatarId: string
	avatarUrl: string
}

export type FileMS_GetUserAvatarInContract = {
	userId: number
}
export type FileMS_GetUserAvatarOutContract = {
	avatarUrl: null | string
}

export type FileMS_DeleteUserAvatarInContract = {
	userId: number
}

export type FileMS_SavePostImagesInContract = {
	postId: number
	photoFiles: Express.Multer.File[]
}

export type FileMS_GetPostImagesInContract = {
	postId: number
}
export type FileMS_GetPostImagesOutContract = {
	imagesUrls: string[]
}

export type FileMS_DeletePostImagesInContract = {
	postId: number
}
