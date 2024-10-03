import { Injectable } from '@nestjs/common'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MainConfigService } from '@app/config'
import { SaveFileInContract, SaveUserAvatarInContract } from './contracts/contracts'
import { ErrorMessage } from '../../main/src/infrastructure/exceptionFilters/layerResult'

@Injectable()
export class FilesService {
	s3Client: S3Client

	constructor(private mainConfig: MainConfigService) {
		const { region, endpoint, accessKeyId, secretAccessKey } = this.mainConfig.get().s3

		this.s3Client = new S3Client([
			{
				region,
				endpoint,
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
			},
		])
	}

	async saveUserAvatar(saveUserAvatarInContract: SaveUserAvatarInContract) {
		const { userId, avatarFile } = saveUserAvatarInContract

		// Create avatar image dataset
		const fileExtension =
			avatarFile.originalname.split('.')[avatarFile.originalname.split('.').length - 1]
		const avatarUrl = 'users/' + userId + '/avatar.' + fileExtension

		const setUserAvatarContract: SaveFileInContract = {
			mimetype: avatarFile.mimetype,
			filePath: avatarUrl,
			fileBuffer: avatarFile.buffer,
			fileSize: avatarFile.size,
		}

		try {
			await this.save(setUserAvatarContract)
			return avatarUrl
		} catch (error: any) {
			throw new Error(ErrorMessage.CannotSaveFile)
		}
	}

	async save(fileData: SaveFileInContract) {
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
			// Класс PutObjectCommand создаёт экземпляр класса создающего файл.
			new DeleteObjectCommand({
				Bucket: bucket,
				// Путь до файла
				Key: filePath,
			}),
		)
	}
}
