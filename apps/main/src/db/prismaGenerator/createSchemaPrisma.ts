import { BdConfig } from '../dbConfig/dbConfigType'

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
	const topAndTablesArr = []

	topAndTablesArr.push(getTopPrismaSchema())

	// Creates models
	for (const tableName in bdConfig) {
		topAndTablesArr.push(createTableSchema(bdConfig, tableName, bdConfig[tableName]))
	}

	return topAndTablesArr.join('\n')
}

function getTopPrismaSchema() {
	return `generator client {
	provider      = "prisma-client-js"
	binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}`
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
 * @param bdConfig
 * @param tableName — name of a table
 * @param tableConfig — config of a table
 */
function createTableSchema(
	bdConfig: BdConfig.Root,
	tableName: string,
	tableConfig: BdConfig.Table,
) {
	let content = `
model ${tableName} {
`
	const columnsArr: string[] = []

	for (const dbFieldName in tableConfig.dbFields) {
		const field = tableConfig.dbFields[dbFieldName]

		if (field.type === 'index') {
			columnsArr.push(`\t${dbFieldName}	Int	@id	@default(autoincrement())`)
		} else if (['string', 'email'].includes(field.type)) {
			columnsArr.push(`\t${dbFieldName}	String` + createColumnAttrs(field))
		} else if (field.type === 'boolean') {
			columnsArr.push(`\t${dbFieldName}	Boolean` + createColumnAttrs(field))
		} else if (field.type === 'number') {
			columnsArr.push(`\t${dbFieldName}	Int` + createColumnAttrs(field))
		} else if (field.type === 'manyToOne') {
			columnsArr.push(...createManyToOneColumn(bdConfig, dbFieldName, field))
		} else if (field.type === 'oneToMany') {
			columnsArr.push(`\t${dbFieldName}	${dbFieldName}[]`)
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

	if (
		columnConfig.type !== 'index' &&
		columnConfig.type !== 'manyToOne' &&
		columnConfig.type !== 'oneToMany'
	) {
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

	if (!attrStrings.length) return ''

	const attrsString = attrStrings.join('\t')

	// Add tabulation if a string starts with a '?'
	return attrsString.startsWith('?') ? attrsString : '\t' + attrsString
}

/**
 * The function gets field name, userId for example
 * and a fieldConfig, like this:
 * {
 * 	type: 'manyToOne'
 * 	relation: {
 * 		thisField: userId
 * 		foreignTable: User // Name of the table that this column refers to
 * 		foreignField: id // Name of the column of foreign table that this column refers to
 * 	}
 *
 * 	and returns an array with 2 strings:
 * 	['author User @relation(fields: [authorId], references: [id])', userId  Int]
 * }
 * @param dbConfig
 * @param fieldName
 * @param fieldConfig
 */
function createManyToOneColumn(
	dbConfig: BdConfig.Root,
	fieldName: string,
	fieldConfig: BdConfig.ManyToOneField,
) {
	// Get first column name from thisField name: userId -> user
	const firstColumnName = fieldConfig.thisField.slice(0, -2)

	// User, userId, id
	const { foreignTable, thisField, foreignField } = fieldConfig

	// For example: 'user User @relation(fields: [userId], references: [id])'
	const firstColumn = `${firstColumnName} ${foreignTable} @relation(fields: [${thisField}], references: [${foreignField}])`

	// For example: 'userId Int'
	const secondColumn = thisField + ' Int'

	return ['\t' + firstColumn, '\t' + secondColumn]
}
