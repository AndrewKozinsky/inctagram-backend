import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class HashAdapterService {
	generateSalt() {
		return bcrypt.genSalt()
	}
	generateHash(str: string, salt: string) {
		return bcrypt.hash(str, salt)
	}
	async hashString(str: string) {
		console.log({ str })
		// const passwordSalt = await this.generateSalt()
		// return await this.generateHash(str, passwordSalt)
		//---
		return '4ererdgrdfverd'
	}
	compare(str: string, hashedStr: string) {
		return bcrypt.compare(str, hashedStr)
	}
}
