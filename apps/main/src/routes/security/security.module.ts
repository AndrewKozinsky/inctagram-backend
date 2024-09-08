import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { PrismaService } from '../../db/prisma.service'
import { MainConfigService } from '@app/config'
import { HashAdapterService } from '@app/hash-adapter'
import { BrowserServiceService } from '@app/browser-service'
import { JwtAdapterService } from '@app/jwt-adapter'
import { UserRepository } from '../../repositories/user.repository'
import { AuthRepository } from '../../repositories/auth.repository'
import { UserQueryRepository } from '../../repositories/user.queryRepository'
import { SecurityController } from './security.controller'

const services = [
	PrismaService,
	MainConfigService,
	HashAdapterService,
	BrowserServiceService,
	JwtAdapterService,
]

const repositories = [UserRepository, UserQueryRepository, AuthRepository]

const commandHandlers: any[] = []

@Module({
	imports: [CqrsModule],
	controllers: [SecurityController],
	providers: [...services, ...repositories, ...commandHandlers],
})
export class SecurityModule {}
