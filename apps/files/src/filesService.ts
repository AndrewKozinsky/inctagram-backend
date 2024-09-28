import { Injectable } from '@nestjs/common'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { SaveFileInContract } from './contracts/contracts'

@Injectable()
export class FilesService {
	s3Client: S3Client

	constructor() {
		this.s3Client = new S3Client({
			region: 'ru-central1-a',
			// Указать адрес сервиса Яндекса
			endpoint: 'https://storage.yandexcloud.net',
			credentials: {
				// Указать ключ доступа к учётной записи
				accessKeyId: 'YCAJEoIX9vzX607TrJy8nGndP',
				// Указать секретный ключ доступа к учётной записи
				secretAccessKey: 'YCOo56MU5FWyHjhS8kmVIbk-T_sr9uXxm9W2SrRE',
			},
		})
	}

	async save(fileData: SaveFileInContract) {
		const uploadRes = await this.s3Client.send(
			// Класс PutObjectCommand создаёт экземпляр класса создающего файл.
			new PutObjectCommand({
				// Передам название своей корзины
				Bucket: 'sociable-people',
				// Указать путь до файла.
				Key: fileData.filePath,
				// Содержимое файла.
				Body: fileData.fileBuffer,
				// Чтобы при запросе сохранённого файла в браузере он правильно отображался
				// нужно задать ContentType, но я не знаю как его получить.
				// Если не задать, то браузер просто предложит скачать без просмотра.
				ContentType: fileData.mimetype,
				// ContentLength
			}),
		)
		return uploadRes
	}
}
