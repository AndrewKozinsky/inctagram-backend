import { Injectable } from '@nestjs/common'
import { Post, PostPhoto, User } from '@prisma/client'
import { add } from 'date-fns'
import { HashAdapterService } from '@app/hash-adapter'
import { PrismaService } from '../db/prisma.service'
import { CreateUserDtoModel } from '../models/user/user.input.model'
import { UserServiceModel } from '../models/user/user.service.model'
import { createUniqString } from '@app/shared'
import { JwtAdapterService } from '@app/jwt-adapter'
import { CreatePostDtoModel } from '../models/post/post.input.model'
import { PostServiceModel } from '../models/post/post.service.model'
import { PostPhotoServiceModel } from '../models/postPhoto/post.service.model'

@Injectable()
export class PostPhotoRepository {
	constructor(private prisma: PrismaService) {}

	async createPostPhoto(postId: number, photoUrl: string) {
		const postPhoto = await this.prisma.postPhoto.create({
			data: {
				post_id: postId,
				url: photoUrl,
			},
		})

		return this.mapDbPostToServicePost(postPhoto)
	}

	async deletePostPhotos(postId: number) {
		await this.prisma.postPhoto.deleteMany({
			where: {
				post_id: postId,
			},
		})
	}

	mapDbPostToServicePost(dbPostPhoto: PostPhoto): PostPhotoServiceModel {
		return {
			id: dbPostPhoto.id,
			url: dbPostPhoto.url,
		}
	}
}
