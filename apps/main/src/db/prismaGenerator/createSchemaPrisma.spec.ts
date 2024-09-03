import { BdConfig } from '../dbConfig/dbConfigType'
import { createSchemaPrisma } from './createSchemaPrisma'

export const bdTestConfig = {
	User: {
		dtoProps: {},
		dbFields: {
			id: {
				type: 'index',
			},
			email: {
				type: 'email',
				unique: true,
				required: true,
			},
			name: {
				type: 'string',
				unique: true,
				required: true,
			},
			isEmailConfirmed: {
				type: 'boolean',
				default: false,
				required: true,
			},
			DeviceToken: {
				type: 'oneToMany',
			},
		},
	},
	DeviceToken: {
		dtoProps: {},
		dbFields: {
			id: {
				type: 'index',
			},
			deviceIP: {
				type: 'string',
				required: true,
			},
			userId: {
				type: 'manyToOne',
				thisField: 'userId',
				foreignTable: 'User',
				foreignField: 'id',
			},
		},
	},
} satisfies BdConfig.Root

describe('createSchemaPrisma', () => {
	it.only('createSchemaPrisma', () => {
		const expectedPrismaSchema = `generator client {
	provider      = "prisma-client-js"
	binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}

model User {
	id	Int	@id	@default(autoincrement())
	email	String	@unique
	name	String	@unique
	isEmailConfirmed	Boolean	@default(false)
	DeviceToken	DeviceToken[]
}

model DeviceToken {
	id	Int	@id	@default(autoincrement())
	deviceIP	String
	user User @relation(fields: [userId], references: [id])
	userId Int
}`

		const generatedPrismaSchema = createSchemaPrisma(bdTestConfig)

		expect(generatedPrismaSchema).toBe(expectedPrismaSchema)
	})
})
