export enum FileMS_EventNames {
	SaveUserAvatar = 'saveUserAvatar',
	GetUsersAvatars = 'getUsersAvatars',
	GetUserAvatar = 'getUserAvatar',
	DeleteUserAvatar = 'deleteUserAvatar',

	SavePostPhoto = 'savePostPhoto',
	GetPostPhotos = 'getPhotosByIds',
	// GetPostsImages = 'getPostsImages',
	DeletePostPhoto = 'deletePostPhoto',

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

export type FileMS_SavePostPhotoInContract = {
	postPhotoFile: Express.Multer.File
}
export type FileMS_SavePostPhotoOutContract = {
	photoId: string
}

/*export type FileMS_GetPostsImagesInContract = {
	postsIds: number[]
}*/
/*export type FileMS_GetPostsImagesOutContract = {
	postId: number
	photosUrls: string[]
}[]*/

export type FileMS_GetPostPhotosInContract = {
	photosIds: string[]
}
export type FileMS_GetPostPhotosOutContract = {
	id: string
	url: string
}[]

export type FileMS_DeletePostPhotoInContract = {
	photoId: string
}
export type FileMS_DeletePostPhotoOutContract = null
