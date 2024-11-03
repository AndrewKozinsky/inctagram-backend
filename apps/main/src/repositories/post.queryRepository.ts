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
			photo_id: string // 'sfsdg5wd'
		}

		const rowPosts: RawPost[] = await this.prisma.$queryRaw`SELECT
			p.id,
			p.text,
			p.created_at,
			(SELECT id as "user_id" FROM "User" WHERE id = p.user_id),
			(SELECT user_name FROM "User" WHERE id=p.user_id),
			pp.files_ms_post_photo_id AS photo_id
			FROM "Post" p
			LEFT JOIN "PostPhoto" pp ON p.id = pp.post_id
			ORDER BY p.created_at DESC
			LIMIT 100`

		type CompiledPost = {
			id: number
			text: string
			createdAt: string
			user: { id: number; name: string; avatar: null | string }
			photos: { id: string; url: string }[]
		}

		const usersIds = new Set()
		rowPosts.forEach((post) => {
			usersIds.add(post.user_id)
		})
		const usersAvatars = await this.postBaseRepository.getUsersAvatars(
			Array.from(usersIds) as number[],
		)

		const postPhotosIds = rowPosts.map((post) => {
			return post.photo_id
		})
		const postsPhotos = await this.postBaseRepository.getPostPhotos(postPhotosIds)

		const compiledPosts: CompiledPost[] = []

		rowPosts.forEach((rawPost) => {
			let compiledPost = compiledPosts.find((post) => post.id === rawPost.id)

			// If post not exists
			if (!compiledPost) {
				const userAvatarDetails = usersAvatars.find(
					(avatar) => avatar.userId === rawPost.user_id,
				)
				const userAvatar = userAvatarDetails ? userAvatarDetails.avatarUrl : null

				compiledPosts.push({
					id: rawPost.id,
					text: rawPost.text,
					createdAt: rawPost.created_at,
					user: {
						id: rawPost.user_id,
						name: rawPost.user_name,
						avatar: userAvatar,
					},
					photos: [],
				})
			}

			compiledPost = compiledPosts.find((post) => post.id === rawPost.id)

			const postPhoto = postsPhotos.find((pPhoto) => {
				return pPhoto.id == rawPost.photo_id
			})

			if (postPhoto) {
				compiledPost!.photos.push(postPhoto)
			}
		})

		return compiledPosts
	}

	async getPostById(postId: number) {
		const post = await this.prisma.post.findUnique({
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

	async getUserPosts(userId: number, query: GetUserPostsQueries) {
		console.log({ userId })
		console.log({ query })
		const pageNumber = query.pageNumber ? +query.pageNumber : 1
		console.log({ pageNumber })
		const pageSize = query.pageSize ? +query.pageSize : 10
		console.log({ pageSize })

		const totalUserPostsCount = await this.prisma.post.count({
			where: { user_id: userId },
			orderBy: [{ created_at: 'desc' }],
		})
		console.log({ totalUserPostsCount })

		const pagesCount = Math.ceil(totalUserPostsCount / pageSize)
		console.log({ pagesCount })

		const userPosts = await this.prisma.post.findMany({
			where: { user_id: userId },
			include: {
				PostPhoto: true,
			},
			skip: (pageNumber - 1) * pageSize,
			take: pageSize,
			orderBy: {
				created_at: 'desc',
			},
		})
		console.log({ userPosts })

		const allPostsPhotosIds: string[] = []
		userPosts.forEach((post) => {
			for (const photo of post.PostPhoto) {
				allPostsPhotosIds.push(photo.files_ms_post_photo_id)
			}
		})

		const allPostsPhotos = await this.postBaseRepository.getPostPhotos(allPostsPhotosIds)

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: +totalUserPostsCount,
			items: userPosts.map((post) => {
				// Get photos of this post by enumerating photos of all posts
				const thisPostPhotos = post.PostPhoto.reduce(
					(acc, thisPostPhotoItem) => {
						const thisPostPhoto = allPostsPhotos.find(
							(postsPhotosItem) =>
								postsPhotosItem.id === thisPostPhotoItem.files_ms_post_photo_id,
						)

						if (thisPostPhoto) acc.push(thisPostPhoto)

						return acc
					},
					[] as { id: string; url: string }[],
				)

				return this.mapDbPostToServicePost(post, thisPostPhotos)
			}),
		}
	}

	mapDbPostToServicePost(
		dbPost: Post,
		postPhotos: {
			id: string
			url: string
		}[],
	): PostOutModel {
		return {
			id: dbPost.id,
			text: dbPost.text,
			location: dbPost.location,
			userId: dbPost.user_id,
			photos: postPhotos,
		}
	}
}
