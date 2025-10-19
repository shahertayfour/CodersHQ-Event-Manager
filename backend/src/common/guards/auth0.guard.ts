import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { auth } from 'express-oauth2-jwt-bearer';

@Injectable()
export class Auth0Guard implements CanActivate {
  private checkJwt: any;

  constructor(private configService: ConfigService) {
    this.checkJwt = auth({
      audience: this.configService.get('AUTH0_AUDIENCE'),
      issuerBaseURL: this.configService.get('AUTH0_ISSUER_URL'),
      tokenSigningAlg: 'RS256',
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Promise((resolve, reject) => {
      this.checkJwt(request, response, (err: any) => {
        if (err) {
          reject(new UnauthorizedException(err.message || 'Unauthorized'));
        }
        // Token is valid, user info is in request.auth
        resolve(true);
      });
    });
  }
}
