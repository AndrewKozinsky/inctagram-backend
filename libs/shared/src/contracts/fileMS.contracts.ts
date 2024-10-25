export enum FileMS_EventNames {
	SaveUserAvatar = 'saveUserAvatar',
	GetUserAvatar = 'getUserAvatar',
	DeleteUserAvatar = 'deleteUserAvatar',
	SavePostImages = 'savePostImages',
	DeletePostImages = 'deletePostImages',
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

export type FileMS_DeleteFileInContract = {
	userId: number
}

export type FileMS_SavePostImagesInContract = {
	postId: number
	photoFiles: Express.Multer.File[]
}

export type FileMS_DeletePostImagesInContract = {
	postId: number
}
