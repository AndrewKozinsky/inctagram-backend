export type PostServiceModel = {
	id: number
	text: string | null
	location: string | null
	userId: number
	photos: {
		url: string
	}[]
}
