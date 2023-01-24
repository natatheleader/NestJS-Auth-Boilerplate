import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as firebase from "firebase-admin";
import * as serviceAccount from '../firebase/someFileHere.json';

const firebase_params = {
    type: serviceAccount.type,
    projectId: serviceAccount.project_id,
    privateKeyId: serviceAccount.private_key_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    clientId: serviceAccount.client_id,
    authUri: serviceAccount.auth_uri,
    tokenUri: serviceAccount.token_uri,
    authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
    clientC509Url: serviceAccount.client_x509_cert_url
}

@Injectable()
export class PreauthMiddleware implements NestMiddleware {
    private defaultApp: any;

    constructor () {
        this.defaultApp = firebase.initializeApp({
            credential: firebase.credential.cert(firebase_params),
            databaseURL: 'https://aratkillo-1bd43-firebase-admin'
        });
    }

    use (req: Request, res: Response, next: Function) {
        const token = req.headers.authorization;
        if (token != null && token != '') {
            this.defaultApp.auth().verifyIdToken(token.replace('Bearer ', ''))
            .then(async decodedToken => {
                const user = {
                    phone: decodedToken.phone_number
                }
                req['user'] = user;
                next();
            }).catch(error => {
                console.error(error);
                this.accessDenied(req.url, res);
            });
        } else {
            next();
        }
    }

    private accessDenied (url: string, res: Response) {
        res.status(403).json({
            statusCode: 403,
            timestamp: new Date().toISOString(),
            path: url,
            message: 'Access Denied',
        });
    }
}