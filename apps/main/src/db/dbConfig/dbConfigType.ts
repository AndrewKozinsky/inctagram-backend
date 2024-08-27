/** Database structure type. */
export namespace BdConfig {
	export type Root = Record<string, Table>

	export type Table = {
		dtoProps: Record<string, Field>
		dbFields: Record<string, Field>
	}

	export type Field = IndexField | StringField | BooleanField | EmailField | NumberField

	type FieldCommonProps = {
		// Default value
		default?: string | number | boolean
		// Is the field required? False by default
		required?: boolean
		// Is the field value must be unique?
		unique?: boolean
	}

	export type IndexField = {
		type: 'index'
	}

	export type StringField = FieldCommonProps & {
		type: 'string'
		minLength?: number
		maxLength?: number
		match?: RegExp
		matchErrorMessage?: string
	}

	export type BooleanField = FieldCommonProps & {
		type: 'boolean'
	}

	export type EmailField = FieldCommonProps & {
		type: 'email'
	}

	export type NumberField = FieldCommonProps & {
		type: 'number'
	}
}