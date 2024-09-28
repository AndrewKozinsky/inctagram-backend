export enum FileEventNames {
	Save = 'save',
}

export type SaveFileInContract = {
	mimetype: string
	filePath: string
	fileBuffer: Buffer
}
