import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from 'shared/config/config.service';
import { ConfigVar } from 'shared/config/config.enum';
import { JwtPayload } from '../jwt-payload.model';

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly _authService: AuthService, private readonly _configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: _configService.getConfigVariable(ConfigVar.JWT_KEY),
        });
    }

    async validate(payload: JwtPayload, done: VerifiedCallback) {
        const user = await this._authService.validateUser(payload);
        if (!user) {
            return done('Unauthorized', false);
        }

        return done(null, user, payload.iat);
    }
}