import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto, LoginDto, ForgetDto, ResetDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
    constructor (
        private prisma: PrismaService, 
        private jwt: JwtService,
        private config: ConfigService,
        private mailService: MailService,
    ) {}
    
    async signup (dto: RegisterDto) {
        //generate the password
        const hash = await this.hashData(dto.password);

        try {
            //save the user
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hash,
                    username: dto.username,
                    is_active: true,
                },
            });

            const body = {
                sub: user.id,
                email: user.email,
                name: user.username
            }
    
            const secret = this.config.get('JWT_SECRET');
    
            const token = await this.jwt.signAsync(
                body, 
                {
                    expiresIn: '60m',
                    secret: secret
                },
            );

            // token = await argon.hash(user.id + user.username + user.created_at + "_" + );//consider expiration

            //send an email
            await this.mailService.sendUserConfirmation(user.email, user.username, token);
            //return the user
            const tokens = await this.getTokens(user.id, user.username, user.email);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;

            // return this.signToken(user.id, user.email, user.is_verified);
        } catch(error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException (
                        'Credentials Taken'
                    )
                }
            }
            throw error;
        }
    }

    async signin (dto: LoginDto) {
        //find user by ID
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        })
        //if user doesn't exist throw error
        if (!user) {
            throw new ForbiddenException (
                'Credentials Incorrect'
            );
        } else if (user.provider !== "local" && user.provider !== "all") {
            throw new ForbiddenException (
                'User is not registered via Email auth provider. Please try another way.'
            );
        }
        //compare password
        const pwMatches = await argon.verify(
            user.password,
            dto.password,
        );
        // if incorrect password throw error
        if (!pwMatches) {
            throw new ForbiddenException (
                'Credentials Incorrect'
            );
        }
        //return user
        return this.signToken(user.id, user.email, user.is_verified);
    }

    async logout(userId: string) {
        // console.log(userId);
        this.updateRefreshToken(userId, "");
        const updatedUser = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        return updatedUser;
    } 

    async resendVerificationLink (id: string) {
        //send a new token via email
        const secret = this.config.get('JWT_SECRET');
        try {
            //fetch user by id
            const user = await this.prisma.user.findUnique({
                where: {
                    id: id,
                }
            })

            const body = {
                sub: user.id,
                email: user.email,
                name: user.username
            }

            const token = await this.jwt.signAsync(
                body, 
                {
                    expiresIn: '60m',
                    secret: secret
                },
            );
            
            //send an email
            await this.mailService.sendUserConfirmation(user.email, user.username, token);
            return {'message' : 'verification email has been sent. please verify your account.'}
        } catch (error) {
            throw new ForbiddenException (
                'Invalide link. Please try again.'
            )
        }
    }   

    async verify (token: string) {
        const secret = this.config.get('JWT_SECRET');
        try {
            const decoded = this.jwt.verify(token, {secret: secret});

            //fetch user by id
            const user = await this.prisma.user.findUnique({
                where: {
                    id: decoded.sub,
                }
            })
            //verify the user
            if (user.email !== decoded.email && user.username !== decoded.name) {
                throw new ForbiddenException (
                    'Invalid Token'
                )
            } else {
                const updatedUser = await this.prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        is_verified: true
                    }
                });

                return this.signToken(updatedUser.id, updatedUser.email, updatedUser.is_verified);
            }
        } catch (error) {
            throw new ForbiddenException (
                'Invalide link. Please request a new link to verify your account.'
            )
        }
    }

    async forget (dto: ForgetDto) {
        try {
            //check if email exist
            const user = await this.prisma.user.findUnique({
                where: {
                    email: dto.email,
                }
            })

            if (!user) {
                throw new ForbiddenException (
                    'Credentials Incorrect'
                );
            }

            // let now = moment().format();
            let now = new Date(new Date().getTime());
            let yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

            //check if request in a day is not more than 3
            const totalRequest = await this.prisma.passwordReset.count({
                where: {
                    user_id: user.id,
                    created_at: {
                        gte: yesterday.toISOString(),
                        lte: now.toISOString()
                    }
                }
            })

            console.log(totalRequest);

            if (totalRequest >= 3) {
                throw new ForbiddenException (
                    'Please try again after 24 hours. You\'ve finished your allowed tries for one day.'
                );
            }

            //generate a token
            const body = {
                sub: user.id,
                email: user.email,
                name: user.username
            }

            const secret = this.config.get('JWT_SECRET');

            const token = await this.jwt.signAsync(
                body, 
                {
                    expiresIn: '60m',
                    secret: secret
                },
            );
            //register to database
            const passwordReset = await this.prisma.passwordReset.create({
                data: {
                    user_id: user.id,
                    reset_token: token,
                    expiries_at: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                },
            });
            
            //send an email with a link to reset password
            await this.mailService.sendResetPassword(user.email, user.username, token);

            return {"msg" : 'Reset Email successfully sent to you\'r email address.'};
        } catch(error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException (
                        'Credentials Taken'
                    )
                }
            }
            throw error;
        }
    }

    async reset (dto: ResetDto) {
        //verify the token
        const secret = this.config.get('JWT_SECRET');
        try {
            const decoded = this.jwt.verify(dto.token, {secret: secret});

            const resetData = await this.prisma.passwordReset.findFirst({
                where: {
                    user_id: decoded.sub,
                }
            })

            if (resetData.reset_token != dto.token) {
                throw new ForbiddenException (
                    'Invalid Token'
                )
            }

            //fetch user by id
            const user = await this.prisma.user.findUnique({
                where: {
                    id: decoded.sub,
                }
            })
            //verify the user
            if (user.email !== decoded.email && user.username !== decoded.name) {
                throw new ForbiddenException (
                    'Invalid Token'
                )
            } else {
                //update the database
                const hash = await this.hashData(dto.password);

                const updatedUser = await this.prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        password: hash
                    }
                });

                //return success
                return {"msg" : 'Password updated successfully.'};
            }
        } catch (error) {
            throw new ForbiddenException (
                'Expired link. Please request a new link to verify your account.'
            )
        }
    }

    async googleAuth (req: any) {
        //first check if user already registered
        const user = await this.prisma.user.findUnique({
            where: {
                email: req.user.emails[0].value,
            }
        })
        //if user doesn't exist register user and give access
        if (!user) {
            try {
                //save the user
                const user = await this.prisma.user.create({
                    data: {
                        email: req.user.emails[0].value,
                        is_verified: req.user.emails[0].verified,
                        username: req.user.name.familyName + "_" + req.user.name.givenName,
                        is_active: true,
                        provider: 'google',
                        password: 'null'
                    },
                });

                //also save some details to the profile from google
        
                //return the user
                const tokens = await this.getTokens(user.id, user.username, user.email);
                await this.updateRefreshToken(user.id, tokens.refreshToken);
                return tokens;
    
                // return this.signToken(user.id, user.email, user.is_verified);
            } catch(error) {
                if (error instanceof PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new ForbiddenException (
                            'Credentials Taken'
                        )
                    }
                }
                throw error;
            }
        } else {
            //just login the user

            //check if users provider is google first
            if (user.provider == "google" || user.provider == "all") {
                return this.signToken(user.id, user.email, user.is_verified);
            } else {
                throw new ForbiddenException (
                    'User is not registered via Google auth provider. Please try another way.'
                );
            }
        }
    }

    async facebookAuth (req: any) {
        //first check if user already registered
        const user = await this.prisma.user.findUnique({
            where: {
                email: req.user.user.email,
            }
        })
        //if user doesn't exist register user and give access
        if (!user) {
            try {
                //save the user
                const user = await this.prisma.user.create({
                    data: {
                        email: req.user.user.email,
                        is_verified: true,
                        username: req.user.user.lastName + "_" + req.user.user.firstName,
                        is_active: true,
                        provider: 'facebook',
                        password: 'null'
                    },
                });

                //also save some details to the profile from facebook
        
                //return the user
                const tokens = await this.getTokens(user.id, user.username, user.email);
                await this.updateRefreshToken(user.id, tokens.refreshToken);
                return tokens;
    
                // return this.signToken(user.id, user.email, user.is_verified);
            } catch(error) {
                if (error instanceof PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new ForbiddenException (
                            'Credentials Taken'
                        )
                    }
                }
                throw error;
            }
        } else {
            //just login the user

            //check if users provider is google first
            if (user.provider == "facebook" || user.provider == "all") {
                return this.signToken(user.id, user.email, user.is_verified);
            } else {
                throw new ForbiddenException (
                    'User is not registered via Facebook auth provider. Please try another way.'
                );
            }
        }
    }

    async signToken(userId: string, email: string, is_verified: boolean): Promise<{access_token: string}>{
        const payload = {
            sub: userId,
            email,
            is_verified: is_verified,
        }

        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(
            payload, 
            {
                expiresIn: '15m',
                secret: secret
            },
        );

        return {
            access_token: token,
        }
    }

    hashData(data: string) {
        return argon.hash(data);
    }
    
    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await this.hashData(refreshToken);

        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                refresh_token: hashedRefreshToken
            }
        });
        // await this.usersService.update(userId, {
        //     refreshToken: hashedRefreshToken,
        // });
    }
    
    async getTokens(userId: string, username: string, userEmail: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(
                {
                    sub: userId,
                    username,
                    userEmail
                },
                {
                    secret: this.config.get('JWT_SECRET'),
                    expiresIn: '15m',
                },
            ),
            this.jwt.signAsync(
                {
                    sub: userId,
                    username,
                    userEmail
                },
                {
                    secret: this.config.get('JWT_REFRESH_SECRET'),
                    expiresIn: '2d',
                },
            ),
        ]);
    
        return {
            accessToken,
            refreshToken,
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user || !user.refresh_token) {
            throw new ForbiddenException('Access Denied');
        }

        const refreshTokenMatches = await argon.verify(
            user.refresh_token,
            refreshToken,
        );

        if (!refreshTokenMatches) {
            throw new ForbiddenException('Access Denied');
        }

        const tokens = await this.getTokens(user.id, user.username, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }      
}