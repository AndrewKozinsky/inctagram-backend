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
			is_email_confirmed: {
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
			device_ip: {
				type: 'string',
				required: true,
			},
			user_id: {
				type: 'manyToOne',
				thisField: 'user_id',
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
	is_email_confirmed	Boolean	@default(false)
	DeviceToken	DeviceToken[]
}

model DeviceToken {
	id	Int	@id	@default(autoincrement())
	device_ip	String
	user User @relation(fields: [user_id], references: [id])
	user_id Int
}`

		const generatedPrismaSchema = createSchemaPrisma(bdTestConfig)

		expect(generatedPrismaSchema).toBe(expectedPrismaSchema)
	})
})
