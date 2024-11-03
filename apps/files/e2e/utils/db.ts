import { FileMS_EventNames } from '@app/shared'
import { ClientProxy } from '@nestjs/microservices'

export async function clearAllDB(emitApp: ClientProxy) {
	await emitApp.send(FileMS_EventNames.EraseDatabase, {}).toPromise()
}
