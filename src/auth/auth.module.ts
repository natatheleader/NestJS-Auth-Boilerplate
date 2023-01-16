import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FacebookStrategy, GoogleStrategy, JwtStrategy, RefreshTokenStrategy } from "./strategy";

@Module({
    imports: [JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, RefreshTokenStrategy, GoogleStrategy, FacebookStrategy]
})

export class AuthModule {}