import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import {
	ErrorMessage,
	FileMS_SavePostPhotoInContract,
	FileMS_SavePostPhotoOutContract,
} from '@app/shared'
import { createUniqString } from '@app/shared'
import { CommonService, SaveFileDetails } from './commonService'
import { PostPhoto } from './schemas/postPhoto.schema'

@Injectable()
export class PostPhotoService {
	constructor(
		private commonService: CommonService,
		@InjectModel(PostPhoto.name) private postPhotoModel: Model<PostPhoto>,
	) {}

	async savePostPhoto(
		savePostPhotoInContract: FileMS_SavePostPhotoInContract,
	): Promise<FileMS_SavePostPhotoOutContract> {
		const { postPhotoFile } = savePostPhotoInContract

		// Create images
		const fileExtension = this.commonService.getFileExtension(postPhotoFile)
		const imageUrl = `posts/${createUniqString()}.${fileExtension}`

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
			imageId: postPhotoInDb._id.toString(),
		}
	}

	/*async getPostsImages(
		getPostsImagesInContract: FileMS_GetPostsImagesInContract,
	): Promise<FileMS_GetPostsImagesOutContract> {
		const { postsIds } = getPostsImagesInContract

		const posts = await this.postPhotoModel.find({ postId: { $in: postsIds } })

		const preparedPosts: FileMS_GetPostsImagesOutContract = []

		posts.forEach((post) => {
			let postInPreparedPosts = findPostInPreparedPosts(preparedPosts, post.postId)

			if (!postInPreparedPosts) {
				preparedPosts.push({ postId: post.postId, imagesUrls: [] })
			}

			postInPreparedPosts = findPostInPreparedPosts(preparedPosts, post.postId)
			postInPreparedPosts!.imagesUrls.push(post.url)
		})

		return preparedPosts

		function findPostInPreparedPosts(
			preparedPosts: FileMS_GetPostsImagesOutContract,
			postId: number,
		) {
			return preparedPosts.find((thisPost) => thisPost.postId === postId)
		}
	}*/

	/*async getPostImages(
		getPostImagesInContract: FileMS_GetPostImagesInContract,
	): Promise<FileMS_GetPostImagesOutContract> {
		const { postId } = getPostImagesInContract

		const postPhotos = await this.postPhotoModel.find({ postId })

		return {
			postId,
			imagesUrls: postPhotos.map((postPhoto) => {
				return postPhoto.url
			}),
		}
	}*/

	/*async deletePostImages(
		deletePostImagesInContract: FileMS_DeletePostImagesInContract,
	): Promise<FileMS_DeletePostImagesOutContract> {
		const { postId } = deletePostImagesInContract

		const postPhotosDetails = await this.postPhotoModel.find({ postId })

		for (const postPhotoDetails of postPhotosDetails) {
			const imageUrl = postPhotoDetails.url

			await this.commonService.deleteFile(imageUrl)
		}

		await this.postPhotoModel.deleteMany({ postId })

		return null
	}*/
}
