import nextConfig from 'eslint-config-next'

export default [
	...nextConfig,
	{
		rules: {
			'react-hooks/immutability': 'off',
			'react-hooks/purity': 'off',
			'react-hooks/refs': 'off',
			'react-hooks/rules-of-hooks': 'off',
			'react-hooks/set-state-in-effect': 'off',
			'react-hooks/static-components': 'off',
			'react/display-name': 'off',
			'react/no-unescaped-entities': 'off',
		},
	},
]
