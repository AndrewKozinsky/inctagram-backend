module.exports = {
	env: {
		// По умолчанию ESLint проверяет код по стандарту ES5.
		// Поэтому конструкции типа const или let будут считаться ошибочными.
		// Чтобы это исправить явно задаётся стандарт языка.
		es2022: true,
	},
	// Требуется указывать такой парсер, чтобы ESLint не показывал ошибки при указании типов.
	parser: '@typescript-eslint/parser',
	parserOptions: {
		// Указание того, что код является модульным чтобы избежать ошибки
		// ESLint: Parsing error: 'import' and 'export' may appear only with 'sourceType: module'
		sourceType: 'module',
	},
	plugins: ['prettier'],
	extends: ['plugin:prettier/recommended', 'prettier'],
	rules: {
		'prettier/prettier': 'error',
		// Одинарные кавычки
		quotes: ['warn', 'single'],
		// Нельзя использовать var
		'no-var': 'error',
		// Предупреждение если переменная никогда не менялась
		'prefer-const': 'warn',
	},
};
