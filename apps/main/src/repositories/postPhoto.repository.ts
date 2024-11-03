import { Injectable } from '@nestjs/common'
import { Post } from '@prisma/client'
import { PrismaService } from '../db/prisma.service'
import { CreatePostDtoModel, UpdatePostDtoModel } from '../models/post/post.input.model'
import { PostServiceModel } from '../models/post/post.service.model'
import { FilesMSEmitService } from './filesMSEmit.service'
import { ErrorMessage } from '@app/shared'

@Injectable()
export class PostPhotoRepository {
	constructor(private prisma: PrismaService) {}
}
