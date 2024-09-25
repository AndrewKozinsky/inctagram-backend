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

// DELETE
/*export class HashAdapterService {
	generateSalt() {
		return randomBytes(16).toString('hex')
	}
	generateHash(str: string, salt: string) {
		return scryptSync(str, salt, 32).toString('hex')
	}
	hashString(str: string) {
		const passwordSalt = this.generateSalt()
		return this.generateHash(str, passwordSalt)
	}
	compare(str: string, hashedStr: string) {
		console.log(this.hashString(str))
		console.log({ hashedStr })
		return this.hashString(str) === hashedStr
	}
}*/

// DELETE
/*@Injectable()
export class HashAdapterService {
	generateSalt() {
		return bcrypt.genSalt()
	}
	generateHash(str: string, salt: string) {
		return bcrypt.hash(str, salt)
	}
	async hashString(str: string) {
		const passwordSalt = await this.generateSalt()
		return await this.generateHash(str, passwordSalt)
	}
	compare(str: string, hashedStr: string) {
		return bcrypt.compare(str, hashedStr)
	}
}*/
