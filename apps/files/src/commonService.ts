import { Injectable } from '@nestjs/common'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MainConfigService } from '@app/config'
import { Connection } from 'mongoose'
import { InjectConnection } from '@nestjs/mongoose'

export type SaveFileDetails = {
	mimetype: string
	filePath: string
	fileBuffer: Buffer
	fileSize: number
}

@Injectable()
export class CommonService {
	s3Client: S3Client

	constructor(
		private mainConfig: MainConfigService,
		@InjectConnection() private connection: Connection,
	) {
		const { region, endpoint, accessKeyId, secretAccessKey } = this.mainConfig.get().s3

		this.s3Client = new S3Client({
			// Указать регион где должны находиться серверы.
			region,
			// Указать адрес сервиса Яндекса
			endpoint,
			credentials: {
				// Ключ доступа к учётной записи
				accessKeyId,
				// Секретный ключ доступа к учётной записи
				secretAccessKey,
			},
		})
	}

	getFileExtension(file: Express.Multer.File) {
		return file.originalname.split('.')[file.originalname.split('.').length - 1]
	}

	async saveFile(fileData: SaveFileDetails) {
		const { bucket } = this.mainConfig.get().s3

		await this.s3Client.send(
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

	async deleteFile(filePath: null | string) {
		if (!filePath) return

		const { bucket } = this.mainConfig.get().s3

		try {
			await this.s3Client.send(
				// DeleteObjectCommand creates an instance deleting a file.
				new DeleteObjectCommand({
					Bucket: bucket,
					Key: filePath,
				}),
			)
		} catch (error) {
			console.log(error)
		}
	}

	async eraseDatabase() {
		if (this.connection.readyState !== 1) return
		const collections = this.connection.collections

		await Promise.all(
			Object.values(collections).map(
				(collection) => collection.deleteMany({}), // an empty mongodb selector object ({}) must be passed as the filter argument
			),
		)
	}
}
