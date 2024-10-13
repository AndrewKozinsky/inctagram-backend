import { Injectable } from '@nestjs/common'
import { Post, PostPhoto, User } from '@prisma/client'
import { PrismaService } from '../db/prisma.service'
import { UserOutModel } from '../models/user/user.out.model'
import { PostOutModel } from '../models/post/post.out.model'
import { UpdatePostDtoModel } from '../models/post/post.input.model'

type DBPostWithPhotos = Post & {
	PostPhoto: PostPhoto[]
}

@Injectable()
export class PostQueryRepository {
	constructor(private prisma: PrismaService) {}

	async getRecentPosts() {
		const posts = await this.prisma.post.findMany({
			include: {
				PostPhoto: true,
			},
		})

		return posts.map(this.mapDbPostToServicePost)
	}

	async getPostById(id: number) {
		const post = await this.prisma.post.findUnique({
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

	async getUserPosts(userId: number) {
		const posts = await this.prisma.post.findMany({
			where: { user_id: userId },
			include: {
				PostPhoto: true,
			},
		})

		return posts.map(this.mapDbPostToServicePost)
	}

	mapDbPostToServicePost(dbPost: DBPostWithPhotos): PostOutModel {
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
