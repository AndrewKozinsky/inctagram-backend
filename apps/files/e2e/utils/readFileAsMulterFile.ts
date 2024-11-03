import fs from 'node:fs/promises'
import path from 'path'
import { Readable } from 'stream'

export async function readFileAsMulterFile(filePath: string): Promise<Express.Multer.File> {
	const buffer = await fs.readFile(filePath) // Read the file as a buffer
	const fileStat = await fs.stat(filePath) // Get file details
	const originalname = path.basename(filePath) // Extract the original file name
	// const mimetype = 'application/octet-stream' // Default mime type (change if needed)

	const stream = new Readable()
	stream.push(buffer)
	stream.push(null) // Signal the end of the stream

	return {
		fieldname: 'file', // Default field name
		originalname: originalname, // Extracted file name
		encoding: '7bit', // Default encoding
		mimetype: 'image/png', // Mime type (adjust based on your file)
		size: fileStat.size, // Size of the file
		buffer: buffer, // Buffer of the file content
		stream: stream, // Readable stream of the buffer
		destination: '',
		filename: '',
		path: '',
	}
}
