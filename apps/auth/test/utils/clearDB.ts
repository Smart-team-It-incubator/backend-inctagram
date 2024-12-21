import { HttpStatus, INestApplication } from '@nestjs/common'
import { agent as request } from 'supertest'
import { RouteNames } from './../../src/routesConfig/routeNames'


export async function clearAllDB(app: INestApplication<any>) {
    console.log("ROUTE",RouteNames.TESTING.ALL_DATA.full)
	await request(app.getHttpServer())
    
		.delete('/' + RouteNames.TESTING.ALL_DATA.full)
		.expect(HttpStatus.OK)
}
