import { Module } from '@nestjs/common'
import { FilesController } from './filesController'
import { FilesService } from './filesService'
import { MainConfigModule } from '@app/config'
import { S3Client } from '@aws-sdk/client-s3'

@Module({
	imports: [MainConfigModule],
	controllers: [FilesController],
	providers: [FilesService, S3Client],
})
export class FilesModule {}
