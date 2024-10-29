/** Database structure type. */
export namespace BdConfig {
	export type Root = Record<string, Table>

	export type Table = {
		dtoProps: Record<string, Field>
		dbFields: Record<string, Field>
	}

	export type Field =
		| IndexField
		| StringField
		| DateStringField
		| BooleanField
		| EmailField
		| NumberField
		| StringsArrayField
		| CreatedAtField
		| ManyToOneField
		| OneToManyField

	type FieldCommonProps = {
		// Default value
		default?: string | number | boolean
		// Is the field required? True by default
		required: boolean
		// Is the field value must be unique?
		unique?: boolean
		// Field description
		description?: string
		// Field example value
		example?: string | number | boolean
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

	export type DateStringField = FieldCommonProps & {
		type: 'dateString'
	}

	export type BooleanField = FieldCommonProps & {
		type: 'boolean'
	}

	export type EmailField = FieldCommonProps & {
		type: 'email'
	}

	export type NumberField = FieldCommonProps & {
		type: 'number'
		min?: number
		max?: number
	}

	export type StringsArrayField = {
		type: 'stringsArray'
	}

	export type CreatedAtField = {
		type: 'createdAt'
	}

	export type ManyToOneField = {
		type: 'manyToOne'
		thisField: string // Name of the column of this table that refers to another table
		foreignTable: string // Name of the table that this column refers to
		foreignField: string // Name of the column of foreign table that this column refers to
	}

	export type OneToManyField = {
		type: 'oneToMany'
	}
}
