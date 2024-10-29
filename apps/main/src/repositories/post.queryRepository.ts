import { Injectable } from '@nestjs/common'
import { Post } from '@prisma/client'
import { PrismaService } from '../db/prisma.service'
import { PostOutModel } from '../models/post/post.out.model'
import { GetUserPostsQueries } from '../models/user/user.input.model'
import { FilesMSEmitService } from './filesMSEmit.service'

@Injectable()
export class PostQueryRepository {
	constructor(
		private prisma: PrismaService,
		private postBaseRepository: FilesMSEmitService,
	) {}

	async getRecentPosts() {
		type RawPost = {
			id: number
			text: string // 'Post description',
			created_at: string //  2024-10-16T08:50:01.499Z,
			user_id: number // 1,
			user_name: string // 'myUserName',
		}

		const rowPosts: RawPost[] = await this.prisma.$queryRaw`SELECT
			p.id,
			p.text,
			p.created_at,
			(SELECT id as "user_id" FROM "User" WHERE id = p.user_id),
			(SELECT user_name FROM "User" WHERE id=p.user_id),
			FROM "Post" p
			ORDER BY p.created_at DESC
			LIMIT 4`

		type UserPost = {
			id: number
			text: string
			createdAt: string
			user: { id: number; name: string; avatar: null | string }
			photos: { url: string }[]
		}

		const postsPhotos = await this.postBaseRepository.getPostsPhotos(
			rowPosts.map((post) => post.id),
		)
		const usersAvatars = await this.postBaseRepository.getUsersAvatars(
			rowPosts.map((post) => post.user_id),
		)

		const userPosts: UserPost[] = []

		rowPosts.forEach((rawPost) => {
			const postPhotos = postsPhotos.find((postPhotos) => postPhotos.postId === rawPost.id)
			const imagesUrls = postPhotos ? postPhotos.imagesUrls : []

			const userAvatarDetails = usersAvatars.find((user) => user.userId === rawPost.user_id)
			const userAvatar = userAvatarDetails ? userAvatarDetails.avatarUrl : null

			userPosts.push({
				id: rawPost.id,
				text: rawPost.text,
				createdAt: rawPost.created_at,
				user: {
					id: rawPost.user_id,
					name: rawPost.user_name,
					avatar: userAvatar,
				},
				photos: imagesUrls.map((imageUrl) => {
					return { url: imageUrl }
				}),
			})
		})

		return userPosts
	}

	async getPostById(postId: number) {
		const post = await this.prisma.post.findUnique({
			where: { id: postId },
		})

		if (!post) {
			return null
		}

		const postPhotos = await this.postBaseRepository.getPostPhotos(postId)

		return this.mapDbPostToServicePost(post, postPhotos.imagesUrls)
	}

	async getUserPosts(userId: number, query: GetUserPostsQueries) {
		const pageNumber = query.pageNumber ? +query.pageNumber : 1
		const pageSize = query.pageSize ? +query.pageSize : 10

		const totalUserPostsCount = await this.prisma.post.count({
			where: { user_id: userId },
			orderBy: [{ created_at: 'desc' }],
		})

		const pagesCount = Math.ceil(totalUserPostsCount / pageSize)

		const userPosts = await this.prisma.post.findMany({
			where: { user_id: userId },
			skip: (pageNumber - 1) * pageSize,
			take: pageSize,
			orderBy: {
				created_at: 'desc',
			},
		})

		const postsPhotos = await this.postBaseRepository.getPostsPhotos(
			userPosts.map((post) => post.id),
		)

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: +totalUserPostsCount,
			items: userPosts.map((post) => {
				const postPhotos = postsPhotos.find((postPhotos) => postPhotos.postId === post.id)
				const imagesUrls = postPhotos ? postPhotos.imagesUrls : []

				return this.mapDbPostToServicePost(post, imagesUrls)
			}),
		}
	}

	mapDbPostToServicePost(dbPost: Post, postImages: string[]): PostOutModel {
		return {
			id: dbPost.id,
			text: dbPost.text,
			location: dbPost.location,
			userId: dbPost.user_id,
			photos: postImages.map((imageUrl) => {
				return {
					url: imageUrl,
				}
			}),
		}
	}
}
