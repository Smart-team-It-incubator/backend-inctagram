export const RouteNames = {
	AUTH: {
		value: 'auth',
		LOGIN: {
			value: 'login',
			full: 'auth/login',
		},
		REFRESH_TOKEN: {
			value: 'refresh-token',
			full: 'auth/refresh-token',
		},
		LOGOUT: {
			value: 'logout',
			full: 'auth/logout',
		},
	},
	TESTING_AUTH: {
		value: 'testing',
		ALL_DATA: {
			value: 'drop-db',
			full: 'auth/drop-db',
		},
		
	},
	TESTING_CORE: {
		value: 'testing',
		ALL_DATA: {
			value: 'drop-db',
			full: 'users/drop-db',
		},
	},
	USERS: {
		value: 'users',
		REGISTRATION: {
			value: 'registration',
			full: 'users/registration',
		},
	}
}