import { Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getUser() {
		// return this.appService.getUser({ id: 1 })
		return 'Hello World!'
	}

	@Post()
	createUser() {
		return this.appService.createUser({
			name: 'User name',
			email: 'user2@email.ru',
		})
	}
}
