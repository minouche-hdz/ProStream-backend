import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Server } from 'http';

describe('User Flow (e2e)', () => {
  let app: INestApplication;
  const uniqueId = Date.now();
  const user = {
    nom: 'E2E',
    prenom: 'Test',
    email: `e2e_${uniqueId}@test.com`,
    password: 'password123',
    roles: ['user'],
  };
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication>();
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/users/register (POST)', async () => {
    const response = await request(app.getHttpServer() as unknown as Server)
      .post('/users/register')
      .send(user)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toEqual(user.email);
  });

  it('/users/login (POST)', async () => {
    const response = await request(app.getHttpServer() as unknown as Server)
      .post('/users/login')
      .send({ email: user.email, password: user.password })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    accessToken = response.body.access_token;
  });

  it('/users/profile (GET) - Protected Route', async () => {
    const response = await request(app.getHttpServer() as unknown as Server)
      .get('/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toEqual(user.email);
  });
});
