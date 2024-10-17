import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PostQueryRepository } from '../../repositories/post.queryRepository'

export class GetRecentPostsQuery {
	constructor() {}
}

@QueryHandler(GetRecentPostsQuery)
export class GetRecentPostsHandler implements IQueryHandler<GetRecentPostsQuery> {
	constructor(private postQueryRepository: PostQueryRepository) {}

	async execute(command: GetRecentPostsQuery) {
		return await this.postQueryRepository.getRecentPosts()
	}
}
