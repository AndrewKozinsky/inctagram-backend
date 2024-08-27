import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { PrismaService } from '../../prisma.service'
import { AuthService } from './auth.service'
import { MainConfigService } from '@app/config'
import { CqrsModule } from '@nestjs/cqrs'
import { CreateUserHandler } from '../../features/CreateUser.commandHandler'

@Module({
	imports: [CqrsModule],
	controllers: [AuthController],
	providers: [AuthService, PrismaService, MainConfigService, CreateUserHandler],
})
export class AuthModule {}
