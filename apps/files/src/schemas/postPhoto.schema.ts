import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type PostPhotoDocument = HydratedDocument<PostPhoto>

@Schema()
export class PostPhoto {
	@Prop({ required: true })
	url: string

	@Prop({ required: true })
	postId: number
}

export const PostPhotoSchema = SchemaFactory.createForClass(PostPhoto)
