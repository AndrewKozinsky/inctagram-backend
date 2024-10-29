// import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
// import { PostQueryRepository } from '../../repositories/post.queryRepository'
// import { ErrorMessage } from '@app/shared'

/*export class GetPostQuery {
	constructor(public postId: number) {}
}*/

/*@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
	constructor(private postQueryRepository: PostQueryRepository) {}

	async execute(command: GetPostQuery) {
		const { postId } = command

		const post = await this.postQueryRepository.getPostById(postId)

		if (!post) {
			throw new Error(ErrorMessage.PostNotFound)
		}

		return post
	}
}*/
