import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { UserQueryRepository } from '../../repositories/user.queryRepository'

export class GetUsersQuery {
	constructor() {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
	constructor(private userQueryRepository: UserQueryRepository) {}

	async execute(command: GetUsersQuery) {
		return this.userQueryRepository.getUsers()
	}
}
