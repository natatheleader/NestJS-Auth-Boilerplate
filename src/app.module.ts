import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { PreauthMiddleware } from './auth/middleware/preauth.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }), 
        AuthModule, 
        UserModule, 
        PrismaModule, 
        MailModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(PreauthMiddleware).forRoutes({
            path: '/auth/firebase', method: RequestMethod.GET,
        });
    }
}
