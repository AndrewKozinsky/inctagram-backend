export enum FileEventNames {
	Save = 'save',
	Delete = 'delete',
}

export type SaveFileInContract = {
	mimetype: string
	filePath: string
	fileBuffer: Buffer
	fileSize: number
}
