import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { UserQueryRepository } from '../../repositories/user.queryRepository'

export class GetMyProfileQuery {
	constructor(public userId: number) {}
}

@QueryHandler(GetMyProfileQuery)
export class GetMyProfileHandler implements IQueryHandler<GetMyProfileQuery> {
	constructor(private userQueryRepository: UserQueryRepository) {}

	async execute(command: GetMyProfileQuery) {
		const { userId } = command

		const user = await this.userQueryRepository.getUserById(userId)
		return user!
	}
}
