import { Injectable } from '@nestjs/common'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MainConfigService } from '@app/config'
import {
	ErrorMessage,
	FileMS_SaveFileInContract,
	FileMS_SaveUserAvatarInContract,
} from '@app/shared'
import { FileMS_SavePostImagesInContract } from '@app/shared/contracts/fileMS.contracts'
import { createUniqString } from '@app/shared'

@Injectable()
export class FilesService {
	s3Client: S3Client

	constructor(private mainConfig: MainConfigService) {
		const { region, endpoint, accessKeyId, secretAccessKey } = this.mainConfig.get().s3

		this.s3Client = new S3Client({
			// Указать регион где должны находиться серверы.
			// Не нашёл что скрывается за этим названием.
			region,
			// Указать адрес сервиса Яндекса
			endpoint,
			credentials: {
				// Указать ключ доступа к учётной записи
				accessKeyId,
				// Указать секретный ключ доступа к учётной записи
				secretAccessKey,
			},
		})
	}

	async saveUserAvatar(saveUserAvatarInContract: FileMS_SaveUserAvatarInContract) {
		const { userId, avatarFile } = saveUserAvatarInContract

		// Create avatar image dataset
		const fileExtension = this.getFileExtension(avatarFile)
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

	async savePostImages(savePostImagesInContract: FileMS_SavePostImagesInContract) {
		const { userId, photoFiles } = savePostImagesInContract

		const imagesUrls: string[] = []

		// Create avatar image dataset
		for (const imageFile of photoFiles) {
			const fileExtension = this.getFileExtension(imageFile)
			const imageUrl = `users/${userId}/posts/${createUniqString()}.${fileExtension}`

			const setUserAvatarContract: FileMS_SaveFileInContract = {
				mimetype: imageFile.mimetype,
				filePath: imageUrl,
				fileBuffer: imageFile.buffer,
				fileSize: imageFile.size,
			}

			try {
				await this.save(setUserAvatarContract)
				imagesUrls.push(imageUrl)
			} catch (error: any) {
				console.log({ error })
				throw new Error(ErrorMessage.CannotSaveFile)
			}
		}

		return imagesUrls
	}

	getFileExtension(file: Express.Multer.File) {
		return file.originalname.split('.')[file.originalname.split('.').length - 1]
	}

	async save(fileData: FileMS_SaveFileInContract) {
		const { bucket } = this.mainConfig.get().s3

		// console.log(this.s3Client)

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
