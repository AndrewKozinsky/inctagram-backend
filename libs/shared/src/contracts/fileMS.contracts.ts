export enum FileMS_EventNames {
	SaveUserAvatar = 'saveUserAvatar',
	GetUsersAvatars = 'getUsersAvatars',
	GetUserAvatar = 'getUserAvatar',
	DeleteUserAvatar = 'deleteUserAvatar',
	SavePostImages = 'savePostImages',
	GetPostImages = 'getPostImages',
	GetPostsImages = 'getPostsImages',
	DeletePostImages = 'deletePostImages',

	EraseDatabase = 'eraseDatabase',
}

// === AVATAR ===

export type FileMS_SaveUserAvatarInContract = {
	userId: number
	avatarFile: Express.Multer.File
}
export type FileMS_SaveUserAvatarOutContract = {
	avatarUrl: string
}

export type FileMS_GetUsersAvatarsInContract = {
	usersIds: number[]
}
export type FileMS_GetUsersAvatarsOutContract = {
	userId: number
	avatarUrl: null | string
}[]

export type FileMS_GetUserAvatarInContract = {
	userId: number
}
export type FileMS_GetUserAvatarOutContract = {
	avatarUrl: null | string
}

export type FileMS_DeleteUserAvatarInContract = {
	userId: number
}
export type FileMS_DeleteUserAvatarOutContract = null

// === POST IMAGES ===

export type FileMS_SavePostImagesInContract = {
	postId: number
	photoFiles: Express.Multer.File[]
}
export type FileMS_SavePostImagesOutContract = {
	images: string[]
}

export type FileMS_GetPostsImagesInContract = {
	postsIds: number[]
}
export type FileMS_GetPostsImagesOutContract = {
	postId: number
	imagesUrls: string[]
}[]

export type FileMS_GetPostImagesInContract = {
	postId: number
}
export type FileMS_GetPostImagesOutContract = {
	postId: number
	imagesUrls: string[]
}

export type FileMS_DeletePostImagesInContract = {
	postId: number
}
export type FileMS_DeletePostImagesOutContract = null
