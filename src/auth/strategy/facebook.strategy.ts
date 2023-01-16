import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService} from "@nestjs/config";
import { Strategy } from "passport-facebook";

@Injectable()
export class FacebookStrategy extends PassportStrategy(
    Strategy,
    'jwt-facebook',
) {
    constructor(config: ConfigService,) {
        super ({
            clientID: config.get('FACEBOOK_APP_ID'),
            clientSecret: config.get('FACEBOOK_APP_SECRET'),
            callbackURL: config.get('FACEBOOK_APP_URL'),
            scope: "email",
            profileFields: ["emails", "name"],
        });
    }

    async validate (
        accessToken: string, 
        refreshToken: string, 
        profile: any, 
        done: (err: any, user: any, info?: any) => void): Promise<any> {
            const { name, emails } = profile;
            const user = {
                email: emails[0].value,
                firstName: name.givenName,
                lastName: name.familyName,
            };
            const payload = {
                user,
                accessToken,
            };
        
            done(null, payload);
    }
}