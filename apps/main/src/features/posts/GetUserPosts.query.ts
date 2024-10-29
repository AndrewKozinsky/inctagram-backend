// import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
// import { PostQueryRepository } from '../../repositories/post.queryRepository'
// import { GetUserPostsQueries } from '../../models/user/user.input.model'

/*export class GetUserPostsQuery {
	constructor(
		public userId: number,
		public query: GetUserPostsQueries,
	) {}
}*/

/*@QueryHandler(GetUserPostsQuery)
export class GetUserPostsHandler implements IQueryHandler<GetUserPostsQuery> {
	constructor(private postQueryRepository: PostQueryRepository) {}

	async execute(command: GetUserPostsQuery) {
		const { userId, query } = command

		return await this.postQueryRepository.getUserPosts(userId, query)
	}
}*/
