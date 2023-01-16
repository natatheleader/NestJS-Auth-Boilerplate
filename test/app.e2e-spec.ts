import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum'; 
import { RegisterDto } from 'src/auth/dto';
import { AppModule } from '../src/app.module';
import { toUnicode } from 'punycode';

describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService

    beforeAll (async () => {
        const moduleRef = await Test.createTestingModule ({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication()
        app.useGlobalPipes(
            new ValidationPipe ({
                whitelist: true,
            }),
        );

        await app.init();
        await app.listen(3001);
        prisma = app.get(PrismaService);
        prisma.cleanDb();
        pactum.request.setBaseUrl('http://localhost:3001');
    });

    afterAll (() => {
        app.close();
    });

    describe('Auth', () => {
        const dto:RegisterDto = {
            username: 'testUser',
            email: 'test@gmail.com',
            password: 'Pass123',
            passwordConfirm: 'Pass123'
        }

        describe('Signup', () => {
            it('Should throw if email empty', () => {
                return pactum
                .spec()
                .post('/auth/signup',)
                .withBody({
                    password: dto.password,
                    username: dto.username,
                    passwordConfirm: dto.passwordConfirm
                })
                .expectStatus(400);
            });

            it('Should throw if password empty', () => {
                return pactum
                .spec()
                .post('/auth/signup',)
                .withBody({
                    email: dto.email,
                    username: dto.username
                })
                .expectStatus(400);
            });

            it('Should throw if username empty', () => {
                return pactum
                .spec()
                .post('/auth/signup',)
                .withBody({
                    email: dto.email,
                    password: dto.password,
                    passwordConfirm: dto.passwordConfirm
                })
                .expectStatus(400);
            });

            it('Should throw if password didn\'t match', () => {
                return pactum
                .spec()
                .post('/auth/signup',)
                .withBody({
                    email: dto.email,
                    username: dto.username,
                    password: dto.password,
                    passwordConfirm: "password12345"
                })
                .expectStatus(400);
            });

            it('Should throw if no body provided', () => {
                return pactum
                .spec()
                .post('/auth/signup',)
                .withBody({})
                .expectStatus(400);
            });

            it('Should signup', () => {
                return pactum
                .spec()
                .post('/auth/signup',)
                .withBody(dto)
                .expectStatus(201);
            });
        });

        describe('verify', () => {
            it('Should throw if no token provided', () => {
                return pactum
                .spec()
                .get('/auth/confirm',)
                .expectStatus(403);
            });

            it('should throw if invalid token provided', () => {
                return pactum
                .spec()
                .get('/auth/confirm',)
                .withQueryParams({
                    t: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzBlZDJkMC0zNjUwLTRlZjEtYWU5Zi1iN2NlMWI0ZjZhZmEiLCJlbWFpbCI6Im5hdHltYWhldGVtQGdtYWlsLmNvbSIsIm5hbWUiOiJoaSIsImlhdCI6MTY3MjM5MjYxMCwiZXhwIjoxNjcyMzk2MjEwfQ.0TGQu0519Ue_PCmHcxqlE1NhJ-xLXMThLHeb6ri8GCw',
                })
                .expectStatus(403);
            });

            it('should throw if invalid id', () => {
                return pactum
                .spec()
                .get('/auth/confirm',)
                .withQueryParams({
                    id: '2969cf93-a0ce-4169-abcf-5bac2eaacc3b',
                })
                .expectStatus(403);
            });

            it('should throw if no body provided', () => {
                return pactum
                .spec()
                .get('/auth/verification_link',)
                .expectStatus(403);
            })

            // it('should send new link', () => {
            //     return pactum
            //     .spec()
            //     .get('/auth/confirm',)
            //     .withQueryParams({
            //         id: '????',
            //     })
            //     .expectStatus(200);
            // })

            // it('should verify', () => {
            //     return pactum
            //     .spec()
            //     .get('/auth/confirm',)
            //     .withQueryParams({
            //         t: '$S{verify}'
            //     })
            //     .expectStatus(200);
            // });
        });

        describe('Signin', () => {
            it('Should throw if email empty', () => {
                return pactum
                .spec()
                .post('/auth/signin',)
                .withBody({
                    password: dto.password,
                })
                .expectStatus(400);
            })

            it('Should throw if password empty', () => {
                return pactum
                .spec()
                .post('/auth/signin',)
                .withBody({
                    email: dto.email,
                })
                .expectStatus(400);
            })

            it('Should throw if no body provided', () => {
                return pactum
                .spec()
                .post('/auth/signin',)
                .withBody({})
                .expectStatus(400);
            })

            it('Should signin', () => {
                return pactum
                .spec()
                .post('/auth/signin',)
                .withBody({
                    email: dto.email,
                    password: dto.password
                })
                .expectStatus(200)
                .stores('userAT', 'access_token');
            });
        });

        describe('Reset Password', () => {
            it('Should throw if email doesn\'t exist', () => {
                return pactum
                .spec()
                .post('/auth/forget_password',)
                .withBody({
                    email: 'this@gmail.com',
                })
                .expectStatus(403);
            })

            it('Should throw if no body provided', () => {
                return pactum
                .spec()
                .post('/auth/forget_password',)
                .withBody({
                    
                })
                .expectStatus(400);
            })

            it('Should send mail', () => {
                return pactum
                .spec()
                .post('/auth/forget_password',)
                .withBody({
                    email: dto.email,
                })
                .expectStatus(200)
            });

            it('should throw if no email is provided', () => {
                return pactum
                .spec()
                .patch('/auth/reset_password',)
                .withBody({
                    password: 'passWord123',
                    passwordConfirm: 'passWord123',
                    token: 'some token'
                })
                .expectStatus(400);
            })

            it('should throw if no password is provided', () => {
                return pactum
                .spec()
                .patch('/auth/reset_password',)
                .withBody({
                    email: 'test@gmail.com',
                    passwordConfirm: 'passWord123',
                    token: 'some token'
                })
                .expectStatus(400);
            })

            it('should throw if no password confirmation is provided', () => {
                return pactum
                .spec()
                .patch('/auth/reset_password',)
                .withBody({
                    email: 'test@gmail.com',
                    password: 'passWord123',
                    token: 'some token'
                })
                .expectStatus(400);
            })

            it('should throw if no token is provided', () => {
                return pactum
                .spec()
                .patch('/auth/reset_password',)
                .withBody({
                    email: 'test@gmail.com',
                    password: 'passWord123',
                    passwordConfirm: 'passWord123',
                })
                .expectStatus(400);
            })

            it('should throw if no body is provided', () => {
                return pactum
                .spec()
                .patch('/auth/reset_password',)
                .withBody({
                    
                })
                .expectStatus(400);
            })

            // it('should reset password', () => {
            //     todo();
            // })
        });
    });

    describe('User', () => {
        describe('GetMe', () => {
            it('Should get current user', () => {
                return pactum
                .spec()
                .get('/users/me',)
                .withHeaders({
                    Authorization: 'Bearer $S{userAT}',
                })
                .expectStatus(200);
            });
        });

        describe('EditUser', () => {});
    });
})