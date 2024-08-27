import * as fs from 'node:fs/promises'

export function writeFile(filePath: string, content: string) {
	return fs.writeFile(filePath, content, 'utf8')
}
