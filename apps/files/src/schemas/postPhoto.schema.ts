import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class PostPhoto {
	@Prop({ required: true })
	url: string

	@Prop({ required: true })
	createdAt: string
}

export const PostPhotoSchema = SchemaFactory.createForClass(PostPhoto)
