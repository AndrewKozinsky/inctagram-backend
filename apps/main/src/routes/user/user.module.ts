import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtAdapterService } from '@app/jwt-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { DevicesRepository } from '../../repositories/devices.repository'
import { PrismaService } from '../../db/prisma.service'

const services = [PrismaService, BrowserServiceService, JwtAdapterService]

const repositories = [DevicesRepository]

const commandHandlers: any[] = [
	/*CreateUserHandler*/
]

@Module({
	imports: [CqrsModule],
	controllers: [UserController],
	providers: [...services, ...repositories, ...commandHandlers],
})
export class UserModule {}
