import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class UserAvatar {
	@Prop({ required: true })
	url: string

	@Prop({ required: true })
	userId: number
}

export const UserAvatarSchema = SchemaFactory.createForClass(UserAvatar)
