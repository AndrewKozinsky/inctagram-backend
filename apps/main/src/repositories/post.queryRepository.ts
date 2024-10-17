import { Injectable } from '@nestjs/common'
import { Post, PostPhoto, User } from '@prisma/client'
import { PrismaService } from '../db/prisma.service'
import { UserOutModel } from '../models/user/user.out.model'
import { PostOutModel } from '../models/post/post.out.model'
import { UpdatePostDtoModel } from '../models/post/post.input.model'
import { GetUserPostsQueries } from '../models/user/user.input.model'

type DBPostWithPhotos = Post & {
	PostPhoto: PostPhoto[]
}

@Injectable()
export class PostQueryRepository {
	constructor(private prisma: PrismaService) {}

	async getRecentPosts() {
		type RawPost = {
			id: number
			text: string // 'Post description',
			created_at: string //  2024-10-16T08:50:01.499Z,
			user_id: number // 1,
			user_name: string // 'myUserName',
			user_avatar: null | string // 'url'
			photo_id: number // 2
			photo_url: string // 'url 2'
		}

		const rowPosts: RawPost[] = await this.prisma.$queryRaw`SELECT
			p.id,
			p.text,
			p.created_at,
			(SELECT id as "user_id" FROM "User" WHERE id = p.user_id),
			(SELECT user_name FROM "User" WHERE id=p.user_id),
			(SELECT avatar as "user_avatar" FROM "User" WHERE id=p.user_id),
			pp.id AS photo_id,
			pp.url AS photo_url
			FROM "Post" p
			LEFT JOIN "PostPhoto" pp ON p.id = pp.post_id
			ORDER BY p.created_at DESC
			LIMIT 100`

		type UserPost = {
			id: number
			text: string
			createdAt: string
			user: { id: number; name: string; avatar: null | string }
			photos: { id: number; url: string }[]
		}

		const userPosts: UserPost[] = []

		rowPosts.forEach((rawPost) => {
			if (userPosts.length === 4) return

			const lastUserPost = userPosts[userPosts.length - 1]

			if (!lastUserPost || lastUserPost.id !== rawPost.id) {
				userPosts.push({
					id: rawPost.id,
					text: rawPost.text,
					createdAt: rawPost.created_at,
					user: {
						id: rawPost.user_id,
						name: rawPost.user_name,
						avatar: rawPost.user_avatar,
					},
					photos: [{ id: rawPost.photo_id, url: rawPost.photo_url }],
				})
			} else {
				lastUserPost.photos.push({ id: rawPost.photo_id, url: rawPost.photo_url })
			}
		})

		return userPosts
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
			include: {
				PostPhoto: true,
			},
		})

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: +totalUserPostsCount,
			items: userPosts.map(this.mapDbPostToServicePost),
		}
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
