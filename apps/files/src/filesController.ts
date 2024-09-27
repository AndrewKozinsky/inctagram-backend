import { Controller, Get } from '@nestjs/common'
import { FilesService } from './filesService'
import { MessagePattern } from '@nestjs/microservices'

@Controller()
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@MessagePattern('plain_text')
	getHello(message: string) {
		console.log('Received message:', message)
		return this.filesService.getHello()
	}
}
