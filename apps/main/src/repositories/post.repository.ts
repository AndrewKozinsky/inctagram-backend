import { Injectable } from '@nestjs/common'
import { Post } from '@prisma/client'
import { PrismaService } from '../db/prisma.service'
import { CreatePostDtoModel, UpdatePostDtoModel } from '../models/post/post.input.model'
import { PostServiceModel } from '../models/post/post.service.model'
import { FilesMSEmitService } from './filesMSEmit.service'

@Injectable()
export class PostRepository {
	constructor(
		private prisma: PrismaService,
		private postBaseRepository: FilesMSEmitService,
	) {}

	async createPost(userId: number, dto: CreatePostDtoModel) {
		const post = await this.prisma.post.create({
			data: {
				text: dto.text,
				location: dto.location,
				user_id: userId,
			},
		})

		await this.createPostPhotosFromPhotoIds(post.id, dto.photosIds)

		const photos = await this.postBaseRepository.getPostPhotos(dto.photosIds)

		return this.mapDbPostToServicePost(post, photos)
	}

	async createPostPhotosFromPhotoIds(postId: number, photosIds: string[]) {
		const requests: Promise<any>[] = []

		for (const photoId of photosIds) {
			const request = this.prisma.postPhoto.create({
				data: {
					post_id: postId,
					files_ms_post_photo_id: photoId,
				},
			})

			requests.push(request)
		}

		await Promise.all(requests)
	}

	async getPostById(postId: number) {
		const post = await this.prisma.post.findFirst({
			where: { id: postId },
			include: {
				PostPhoto: true,
			},
		})

		if (!post) {
			return null
		}

		const postPhotos = await this.prisma.postPhoto.findMany({ where: { post_id: postId } })
		const photosIds = postPhotos.map((postPhoto) => postPhoto.files_ms_post_photo_id)

		const photos = await this.postBaseRepository.getPostPhotos(photosIds)

		return this.mapDbPostToServicePost(post, photos)
	}

	async updatePost(postId: number, dto: UpdatePostDtoModel) {
		const newPostData: Record<string, string> = {}
		if (dto.text || dto.text == '') {
			newPostData.text = dto.text
		}
		if (dto.location || dto.location == '') {
			newPostData.location = dto.location
		}

		await this.prisma.post.update({
			where: { id: postId },
			data: newPostData,
		})
	}

	async deletePost(postId: number) {
		const post = await this.getPostById(postId)

		if (!post) {
			return
		}

		for (const photo of post.photos) {
			await this.postBaseRepository.deletePostPhoto(photo.id)
		}

		await this.prisma.postPhoto.deleteMany({
			where: { post_id: postId },
		})

		await this.prisma.post.delete({
			where: { id: postId },
		})
	}

	async deletePostPhoto(photoId: string) {
		await this.postBaseRepository.deletePostPhoto(photoId)

		await this.prisma.postPhoto.findFirst({
			where: { files_ms_post_photo_id: photoId },
		})

		await this.prisma.postPhoto.deleteMany({
			where: { files_ms_post_photo_id: photoId },
		})
	}

	mapDbPostToServicePost(
		dbPost: Post,
		postPhotos: {
			id: string
			url: string
		}[],
	): PostServiceModel {
		return {
			id: dbPost.id,
			text: dbPost.text,
			location: dbPost.location,
			userId: dbPost.user_id,
			photos: postPhotos,
		}
	}
}
