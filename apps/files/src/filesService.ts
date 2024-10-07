import { Injectable } from '@nestjs/common'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MainConfigService } from '@app/config'
import {
	ErrorMessage,
	FileMS_SaveFileInContract,
	FileMS_SaveUserAvatarInContract,
} from '@app/shared'

@Injectable()
export class FilesService {
	s3Client: S3Client

	constructor(private mainConfig: MainConfigService) {
		const { region, endpoint, accessKeyId, secretAccessKey } = this.mainConfig.get().s3

		this.s3Client = new S3Client([
			{
				region: 'ru-central1', // 'ru-central1-a'
				endpoint,
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
			},
		])
	}

	async saveUserAvatar(saveUserAvatarInContract: FileMS_SaveUserAvatarInContract) {
		const { userId, avatarFile } = saveUserAvatarInContract

		// Create avatar image dataset
		const fileExtension =
			avatarFile.originalname.split('.')[avatarFile.originalname.split('.').length - 1]
		const avatarUrl = 'users/' + userId + '/avatar.' + fileExtension

		const setUserAvatarContract: FileMS_SaveFileInContract = {
			mimetype: avatarFile.mimetype,
			filePath: avatarUrl,
			fileBuffer: avatarFile.buffer,
			fileSize: avatarFile.size,
		}

		try {
			await this.save(setUserAvatarContract)
			return avatarUrl
		} catch (error: any) {
			console.log({ error })
			throw new Error(ErrorMessage.CannotSaveFile)
		}
	}

	async save(fileData: FileMS_SaveFileInContract) {
		const { bucket } = this.mainConfig.get().s3

		return await this.s3Client.send(
			// Класс PutObjectCommand создаёт экземпляр класса создающего файл.
			new PutObjectCommand({
				Bucket: bucket,
				// Путь до файла
				Key: fileData.filePath,
				// Содержимое файла
				Body: fileData.fileBuffer,
				ContentType: fileData.mimetype,
				ContentLength: fileData.fileSize,
			}),
		)
	}

	async delete(filePath: string) {
		const { bucket } = this.mainConfig.get().s3

		return await this.s3Client.send(
			// DeleteObjectCommand creates an instance deleting a file.
			new DeleteObjectCommand({
				Bucket: bucket,
				// Путь до файла
				Key: filePath,
			}),
		)
	}
}
