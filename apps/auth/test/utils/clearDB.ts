import { HttpStatus, INestApplication } from '@nestjs/common'
import { agent as request } from 'supertest'
import { RouteNames } from './../../src/routesConfig/routeNames'


export async function clearAuthDB(app: INestApplication<any>) {
	await request(app.getHttpServer())
    
		.delete('/' + RouteNames.TESTING_AUTH.ALL_DATA.full)
		.expect(HttpStatus.OK)
}

export async function clearCoreDB(app: INestApplication<any>) {
	await request(app.getHttpServer())
    
		.delete('/' + RouteNames.TESTING_CORE.ALL_DATA.full)
		.expect(HttpStatus.OK)
}