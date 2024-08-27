import { BdConfig } from '../dbConfig/dbConfigType'
import { bdConfig } from '../dbConfig/dbConfig'

/**
 * Creates a schema.prisma file content from bdConfig.
 * You will get something like this:
 * generator client {
 *     provider      = "prisma-client-js"
 *     binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
 * }
 *
 * datasource db {
 *     provider = "postgresql"
 *     url      = env("DATABASE_URL")
 * }
 *
 * model User {
 *     id                                  Int     @id @default(autoincrement())
 *     email                               String  @unique
 *     hashedPassword                      String
 *     emailConfirmationCode               String?
 *     isEmailConfirmed                    Boolean @default(false)
 * }
 *
 * @param bdConfig
 */
export function createSchemaPrisma(bdConfig: BdConfig.Root) {
	let content = `generator client {
	provider      = "prisma-client-js"
	binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}
	`

	// Creates models
	for (const tableName in bdConfig) {
		content += createTableSchema(tableName, bdConfig[tableName])
	}

	return content
}

/**
 * Creates string like this from tableConfig:
 * model User {
 *     id                                  Int     @id @default(autoincrement())
 *     email                               String  @unique
 *     hashedPassword                      String
 *     emailConfirmationCode               String?
 *     isEmailConfirmed                    Boolean @default(false)
 * }
 * @param tableName — name of a table
 * @param tableConfig — config of a table
 */
function createTableSchema(tableName: string, tableConfig: BdConfig.Table) {
	let content = `
model ${tableName} {
`
	const columnsArr: string[] = []

	for (const dbFieldName in tableConfig.dbFields) {
		const field = tableConfig.dbFields[dbFieldName]

		if (field.type === 'index') {
			columnsArr.push(`\t${dbFieldName}    Int     @id @default(autoincrement())`)
		} else if (['string', 'email'].includes(field.type)) {
			columnsArr.push(`\t${dbFieldName}    String` + createColumnAttrs(field))
		} else if (field.type === 'boolean') {
			columnsArr.push(`\t${dbFieldName}    Boolean` + createColumnAttrs(field))
		} else if (field.type === 'number') {
			columnsArr.push(`\t${dbFieldName}    Int` + createColumnAttrs(field))
		} else if (field.type === 'manyToOne') {
			columnsArr.push(...createRelationColumn(dbFieldName, field))
		}
	}

	content += columnsArr.join('\n')

	content += '\n}'

	return content
}

/**
 * Get column config object and form a string like
 * ? @unique @default(false)
 * depends on passed colum config
 * @param columnConfig
 */
function createColumnAttrs(columnConfig: BdConfig.Field) {
	const attrStrings: string[] = []

	if (columnConfig.type !== 'index' && columnConfig.type !== 'manyToOne') {
		if (columnConfig.required == false) {
			attrStrings.push('?')
		}
		if (columnConfig.default !== undefined) {
			attrStrings.push(`@default(${columnConfig.default})`)
		}
		if (columnConfig.unique) {
			attrStrings.push('@unique')
		}
	}

	const attrsString = attrStrings.join(' ')

	// Add tabulation if a string starts with a '?'
	return attrsString.startsWith('?') ? attrsString : '\t' + attrsString
}

/**
 * The function gets field name, userId for example
 * and a fieldConfig, like this:
 * {
 * 	type: 'manyToOne'
 * 	relation: {
 * 		foreignTable: string // Name of the table that this column refers to
 * 		foreignField: string // Name of the column of foreign table that this column refers to
 * 	}
 *
 * 	and returns an array with 2 strings:
 * 	['author User @relation(fields: [authorId], references: [id])', userId  Int]
 * }
 * @param fieldName
 * @param fieldConfig
 */
function createRelationColumn(fieldName: string, fieldConfig: BdConfig.ManyToOneField) {
	// 'user    User    @relation(fields: [authorId], references: [id])'
	// 'userId Int'
	return ['0', '1']
}
