export enum FileMS_EventNames {
	SaveUserAvatar = 'saveUserAvatar',
	SavePostImages = 'savePostImages',
}

export type FileMS_SaveUserAvatarInContract = {
	userId: number
	avatarFile: Express.Multer.File
}

export type FileMS_SavePostImagesInContract = {
	userId: number
	photoFiles: Express.Multer.File[]
}

export type FileMS_SaveFileInContract = {
	mimetype: string
	filePath: string
	fileBuffer: Buffer
	fileSize: number
}
