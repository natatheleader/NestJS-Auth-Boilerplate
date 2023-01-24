import { Body, Controller, Get, HttpCode, HttpStatus, Post, Patch } from "@nestjs/common";
import { Request } from 'express';
import { Query, Req, UseGuards } from "@nestjs/common/decorators";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, ForgetDto, ResetDto } from "./dto";
import { GoogleGuard, FacebookGuard, JwtGuard, RefreshTokenGuard } from "./guard";

@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup (@Body() dto: RegisterDto) {
        return this.authService.signup(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin (@Body() dto: LoginDto) {
        return this.authService.signin(dto);
    }

    @UseGuards(JwtGuard)
    @Get('logout')
    logout(@Req() req: Request) {
        return this.authService.logout(req.user['id']);
    }

    @HttpCode(HttpStatus.OK)
    @Get('confirm')
    verify (@Query() token: any) {
        return this.authService.verify(token.t);
    }

    @HttpCode(HttpStatus.OK)
    @Get('verification_link')
    resendLink (@Query() id: any) {
        return this.authService.resendVerificationLink(id.id);
    }

    @HttpCode(HttpStatus.OK)
    @Post('forget_password')
    forget (@Body() dto: ForgetDto) {
        return this.authService.forget(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Patch('reset_password')
    reset (@Body() dto: ResetDto) {
        return this.authService.reset(dto);
    }

    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    refreshTokens(@Req() req: Request) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        return this.authService.refreshTokens(userId, refreshToken);
    }

    //Google Auth
    @UseGuards(GoogleGuard)
    @Get('google')
    async googleLogin(){}

    @UseGuards(GoogleGuard)
    @Get('google/callback')
    async callback(@Req() req) {
        return this.authService.googleAuth(req);
    }

    //Facebook Auth
    @UseGuards(FacebookGuard)
    @Get("facebook")
    async facebookLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    @UseGuards(FacebookGuard)
    @Get("facebook/callback")
    async facebookLoginRedirect(@Req() req: Request): Promise<any> {
        return this.authService.facebookAuth(req);
    }

    //firebase
    @Get("firebase")
    async getFirebase(@Req() req: Request): Promise<any> {
        return this.authService.firebaseAuth(req);
        // return 'Hello ' + JSON.stringify(request['user']) + '!';
    }
}