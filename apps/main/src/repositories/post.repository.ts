import { Injectable } from '@nestjs/common'
import { Post, PostPhoto, User } from '@prisma/client'
import { add } from 'date-fns'
import { HashAdapterService } from '@app/hash-adapter'
import { PrismaService } from '../db/prisma.service'
import { CreateUserDtoModel } from '../models/user/user.input.model'
import { UserServiceModel } from '../models/user/user.service.model'
import { JwtAdapterService } from '@app/jwt-adapter'
import { CreatePostDtoModel } from '../models/post/post.input.model'
import { PostServiceModel } from '../models/post/post.service.model'

type DBPostWithPhotos = Post & {
	PostPhoto: PostPhoto[]
}

@Injectable()
export class PostRepository {
	constructor(private prisma: PrismaService) {}

	async createPost(userId: number, dto: CreatePostDtoModel) {
		const post = await this.prisma.post.create({
			data: {
				text: dto.text,
				location: dto.location,
				user_id: userId,
			},
			include: {
				PostPhoto: true,
			},
		})

		return this.mapDbPostToServicePost(post)
	}

	async getPostById(id: number) {
		const post = await this.prisma.post.findFirst({
			where: { id },
			include: {
				PostPhoto: true,
			},
		})

		if (!post) {
			return null
		}

		return this.mapDbPostToServicePost(post)
	}

	/*async updateUser(userId: number, data: Partial<User>) {
		await this.prisma.user.update({
			where: { id: userId },
			data,
		})
	}*/

	/*async deleteUser(userId: number) {
		await this.prisma.user.delete({
			where: { id: userId },
		})
	}*/

	mapDbPostToServicePost(dbPost: DBPostWithPhotos): PostServiceModel {
		return {
			id: dbPost.id,
			text: dbPost.text,
			location: dbPost.location,
			userId: dbPost.user_id,
			photos: dbPost.PostPhoto.map((photo) => {
				return {
					id: photo.id,
					url: photo.url,
				}
			}),
		}
	}
}
