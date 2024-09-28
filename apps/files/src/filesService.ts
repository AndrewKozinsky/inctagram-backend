import { Injectable } from '@nestjs/common'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MainConfigService } from '@app/config'
import { SaveFileInContract } from './contracts/contracts'

@Injectable()
export class FilesService {
	s3Client: S3Client

	constructor(private mainConfig: MainConfigService) {
		const { region, endpoint, accessKeyId, secretAccessKey } = this.mainConfig.get().s3

		this.s3Client = new S3Client({
			region,
			endpoint,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		})
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
