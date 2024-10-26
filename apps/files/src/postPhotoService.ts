import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { ErrorMessage, FileMS_DeletePostImagesInContract } from '@app/shared'
import { FileMS_SavePostImagesInContract } from '@app/shared/contracts/fileMS.contracts'
import { createUniqString } from '@app/shared'
import { CommonService, SaveFileDetails } from './commonService'
import { PostPhoto } from './schemas/postPhoto.schema'

@Injectable()
export class PostPhotoService {
	constructor(
		private commonService: CommonService,
		@InjectModel(PostPhoto.name) private postPhotoModel: Model<PostPhoto>,
	) {}

	async savePostImages(savePostImagesInContract: FileMS_SavePostImagesInContract) {
		const { postId, photoFiles } = savePostImagesInContract

		const imagesUrls: string[] = []

		// Create images
		for (const imageFile of photoFiles) {
			const fileExtension = this.commonService.getFileExtension(imageFile)
			const imageUrl = `posts/${postId}/${createUniqString()}.${fileExtension}`

			const setUserAvatarContract: SaveFileDetails = {
				mimetype: imageFile.mimetype,
				filePath: imageUrl,
				fileBuffer: imageFile.buffer,
				fileSize: imageFile.size,
			}

			try {
				await this.commonService.saveFile(setUserAvatarContract)
				imagesUrls.push(imageUrl)
			} catch (error: any) {
				throw new Error(ErrorMessage.CannotSaveFile)
			}

			await this.postPhotoModel.create<PostPhoto>({
				url: imageUrl,
				postId,
			})
		}

		return imagesUrls
	}

	async deletePostImages(deletePostImagesInContract: FileMS_DeletePostImagesInContract) {
		const { postId } = deletePostImagesInContract

		const postPhotosDetails = await this.postPhotoModel.find({ postId })

		for (const postPhotoDetails of postPhotosDetails) {
			const imageUrl = postPhotoDetails.url

			await this.commonService.deleteFile(imageUrl)
		}

		await this.postPhotoModel.deleteMany({ postId })
	}
}
