export const RouteNames = {
	AUTH: {
		value: 'auth',
		LOGIN: {
			value: 'login',
			full: 'api/v1/auth/login',
		},
		REFRESH_TOKEN: {
			value: 'refresh-token',
			full: 'api/v1/auth/refresh-token',
		},
		LOGOUT: {
			value: 'logout',
			full: 'api/v1/auth/logout',
		},
		GET_ALL_SESSION: {
			value: 'get-all-session',
			full: 'api/v1/auth/sessions',
		},
		DEL_SPECIFIC_SESSION: {
			value: 'del-specific-session',
			full: 'api/v1/auth/sessions/revoke/:sessionId', // /sessions/revoke/:sessionId
		},
		DEL_ALL_SESSION: {
			value: 'del-all-session',
			full: 'api/v1/auth/sessions/revoke-all',
		}
	},
	TESTING_AUTH: {
		value: 'testing',
		ALL_DATA: {
			value: 'drop-db',
			full: 'api/v1/auth/drop-db',
		},
		
	},
	TESTING_CORE: {
		value: 'testing',
		ALL_DATA: {
			value: 'drop-db',
			full: 'api/v1/users/drop-db',
		},
	},
	USERS: {
		value: 'users',
		REGISTRATION: {
			value: 'registration',
			full: 'api/v1/users/registration',
		},
		GET_USER_BY_EMAIL: {
			value: 'getByEmail',
			full: 'api/v1/users/getByEmail',
		},
	}
}