import {
	FileMS_DeleteUserAvatarInContract,
	FileMS_EventNames,
	FileMS_GetUserAvatarInContract,
	FileMS_GetUsersAvatarsInContract,
	FileMS_SaveUserAvatarInContract,
} from '@app/shared'
import { ClientProxy } from '@nestjs/microservices'
import path from 'path'
import { readFileAsMulterFile } from './readFileAsMulterFile'

export const avatarUtils = {
	async createFiveUsersAvatars(emitApp: ClientProxy) {
		for (let i = 1; i < 6; i++) {
			await this.createUserAvatar(emitApp, i)
		}
	},

	async createUserAvatar(emitApp: ClientProxy, userId: number) {
		const avatarFilePath = path.join(__dirname, '../utils/files/avatar.png')
		const avatarFile = await readFileAsMulterFile(avatarFilePath)

		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.SaveUserAvatar
		const payload: FileMS_SaveUserAvatarInContract = {
			userId,
			avatarFile,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
	async getUsersAvatars(emitApp: ClientProxy, usersIds: number[]) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.GetUsersAvatars
		const payload: FileMS_GetUsersAvatarsInContract = {
			usersIds,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
	async getUserAvatar(emitApp: ClientProxy, userId: number) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.GetUserAvatar
		const payload: FileMS_GetUserAvatarInContract = {
			userId,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
	async deleteUserAvatar(emitApp: ClientProxy, userId: number) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.DeleteUserAvatar
		const payload: FileMS_DeleteUserAvatarInContract = {
			userId,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
}
