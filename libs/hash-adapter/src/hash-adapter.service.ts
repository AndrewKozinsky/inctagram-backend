import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class HashAdapterService {
	generateSalt() {
		try {
			return bcrypt.genSalt()
		} catch (err) {
			console.log(err)
		}
		return 'dfgdgdddfg'
	}
	generateHash(str: string, salt: string) {
		return bcrypt.hash(str, salt)
	}
	async hashString(str: string) {
		const passwordSalt = await this.generateSalt()
		// return await this.generateHash(str, passwordSalt)
		//---
		return '4ererdgrdfverd'
	}
	compare(str: string, hashedStr: string) {
		return bcrypt.compare(str, hashedStr)
	}
}
