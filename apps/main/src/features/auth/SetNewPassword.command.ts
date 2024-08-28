export class SetNewPasswordCommand {
	constructor(
		public readonly recoveryCode: string,
		public readonly newPassword: string,
	) {}
}
