import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { ObjectId } from 'mongodb'
import { InjectModel } from '@nestjs/mongoose'
import {
	ErrorMessage,
	FileMS_DeletePostPhotoInContract,
	FileMS_DeletePostPhotoOutContract,
	FileMS_GetPostPhotosInContract,
	FileMS_GetPostPhotosOutContract,
	FileMS_SavePostPhotoInContract,
	FileMS_SavePostPhotoOutContract,
} from '@app/shared'
import { createUniqString } from '@app/shared'
import { CommonService, SaveFileDetails } from './commonService'
import { PostPhoto } from './schemas/postPhoto.schema'
import { MainConfigService } from '@app/config'

@Injectable()
export class PostPhotoService {
	constructor(
		private commonService: CommonService,
		private mainConfig: MainConfigService,
		@InjectModel(PostPhoto.name) private postPhotoModel: Model<PostPhoto>,
	) {}

	async savePostPhoto(
		savePostPhotoInContract: FileMS_SavePostPhotoInContract,
	): Promise<FileMS_SavePostPhotoOutContract> {
		const { postPhotoFile } = savePostPhotoInContract

		// Create images
		const fileExtension = this.commonService.getFileExtension(postPhotoFile)
		const imageUrl = `postPhotos/${createUniqString()}.${fileExtension}`

		const setPhotoContract: SaveFileDetails = {
			mimetype: postPhotoFile.mimetype,
			filePath: imageUrl,
			fileBuffer: postPhotoFile.buffer,
			fileSize: postPhotoFile.size,
		}

		try {
			await this.commonService.saveFile(setPhotoContract)
		} catch (error: any) {
			throw new Error(ErrorMessage.CannotSaveFile)
		}

		const postPhotoInDb = await this.postPhotoModel.create<PostPhoto>({
			url: imageUrl,
			createdAt: new Date().toISOString(),
		})

		return {
			photoId: postPhotoInDb._id.toString(),
		}
	}

	async getPostPhotos(
		getPostPhotosInContract: FileMS_GetPostPhotosInContract,
	): Promise<FileMS_GetPostPhotosOutContract> {
		const { photosIds } = getPostPhotosInContract

		// Check MongoDB identifiers
		let isPhotosIdsCorrect = true
		photosIds.forEach((mongoId) => {
			if (!ObjectId.isValid(mongoId)) {
				isPhotosIdsCorrect = false
			}
		})
		if (!isPhotosIdsCorrect) {
			return []
		}

		const photosIdsInMongoFormat = photosIds.map((photoId) => {
			return new ObjectId(photoId)
		})

		const postPhotos = await this.postPhotoModel.find({ _id: { $in: photosIdsInMongoFormat } })

		return postPhotos.map((postPhoto) => {
			return {
				id: postPhoto._id.toString(),
				url: this.mainConfig.get().s3.filesRootUrl + '/' + postPhoto.url,
			}
		})
	}

	async deletePostPhoto(
		deletePostPhotosInContract: FileMS_DeletePostPhotoInContract,
	): Promise<FileMS_DeletePostPhotoOutContract> {
		const { photoId } = deletePostPhotosInContract

		const postPhoto = await this.postPhotoModel.findOne({ _id: photoId })

		if (postPhoto) {
			await this.commonService.deleteFile(postPhoto.url)
			await this.postPhotoModel.deleteOne({ _id: photoId })
		}

		return null
	}
}
