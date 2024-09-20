import { Injectable } from '@nestjs/common'
import { randomBytes, scryptSync } from 'node:crypto'

@Injectable()
export class HashAdapterService {
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
		return this.hashString(str) === hashedStr
	}
}

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
