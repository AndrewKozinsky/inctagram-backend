import { Transform, TransformFnParams } from 'class-transformer'

export function Trim() {
	return Transform(({ value }: TransformFnParams) => value.trim())
}
