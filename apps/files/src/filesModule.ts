import { Module } from '@nestjs/common'
import { FilesController } from './filesController'
import { FilesService } from './filesService'
import { MainConfigModule } from '@app/config'

@Module({
	imports: [MainConfigModule],
	controllers: [FilesController],
	providers: [FilesService],
})
export class FilesModule {}
