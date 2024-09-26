import { Injectable } from '@nestjs/common'
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'

@Injectable()
export class HashAdapterService {
	private readonly iterations = 10000 // Reduced iterations for faster hashing
	private readonly keyLength = 32 // Reduced key length to speed up hashing

	generateSalt(length = 12): string {
		return randomBytes(length).toString('hex') // Shortened salt length for faster generation
	}

	generateHash(str: string, salt: string): string {
		return pbkdf2Sync(str, salt, this.iterations, this.keyLength, 'sha256').toString('hex')
	}

	async hashString(str: string): Promise<string> {
		const salt = this.generateSalt() // Generate shorter salt
		const hash = this.generateHash(str, salt) // Hash with fewer iterations and smaller key length
		return `${salt}:${hash}` // Combine salt and hash
	}

	compare(str: string, hashedStr: string): boolean {
		const [salt, storedHash] = hashedStr.split(':') // Split stored hash
		const computedHash = this.generateHash(str, salt) // Hash the input string with stored salt
		return timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(computedHash, 'hex'))
	}
}
