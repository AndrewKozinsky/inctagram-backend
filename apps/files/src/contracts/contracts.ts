export enum FileEventNames {
	SaveUserAvatar = 'saveUserAvatar',
}

export type SaveUserAvatarInContract = {
	userId: number
	avatarFile: Express.Multer.File
}

export type SaveFileInContract = {
	mimetype: string
	filePath: string
	fileBuffer: Buffer
	fileSize: number
}
