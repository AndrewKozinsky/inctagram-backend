import { Module } from '@nestjs/common'
import { MainConfigModule, MainConfigService } from '@app/config'
import { S3Client } from '@aws-sdk/client-s3'
import { MongooseModule } from '@nestjs/mongoose'
import { FilesController } from './filesController'
import { AvatarService } from './avatarService'
import { UserAvatar, UserAvatarSchema } from './schemas/userAvatar.schema'
import { CommonService } from './commonService'
import { PostPhotoService } from './postPhotoService'
import { PostPhoto, PostPhotoSchema } from './schemas/postPhoto.schema'

@Module({
	imports: [
		MainConfigModule,
		MongooseModule.forRootAsync({
			imports: [MainConfigModule],
			useFactory: async (configService: MainConfigService) => {
				return {
					uri: configService.get().mongoDb.host,
					dbName: 'files',
				}
			},
			inject: [MainConfigService],
		}),
		MongooseModule.forFeature([
			{ name: UserAvatar.name, schema: UserAvatarSchema },
			{ name: PostPhoto.name, schema: PostPhotoSchema },
		]),
	],
	controllers: [FilesController],
	providers: [CommonService, AvatarService, PostPhotoService, S3Client],
})
export class FilesModule {}
