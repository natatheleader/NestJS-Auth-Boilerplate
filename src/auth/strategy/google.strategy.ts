import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService} from "@nestjs/config";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
    Strategy,
    'jwt-google',
) {
    constructor(config: ConfigService,) {
        super ({
            clientID: config.get('GOOGLE_CLIENT_ID'),
            clientSecret: config.get('GOOGLE_SECRET'),
            callbackURL: config.get('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile']
        })
    }

    async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        done(null, profile);
    }
}