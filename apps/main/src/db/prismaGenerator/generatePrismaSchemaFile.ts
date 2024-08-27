import path from 'path'
import { writeFile } from '../../utils/writeFile'
import { createSchemaPrisma } from './createSchemaPrisma'
import { bdConfig } from '../dbConfig/dbConfig'

export function generatePrismaSchemaFile() {
	const prismaSchemaContent = createSchemaPrisma(bdConfig)

	const prismaFolderPath = path.resolve(__dirname, '../../../../../prisma')
	const prismaSchemaName = 'schema.prisma'
	const fullPath = prismaFolderPath + '/' + prismaSchemaName

	writeFile(fullPath, prismaSchemaContent)
}

generatePrismaSchemaFile()
