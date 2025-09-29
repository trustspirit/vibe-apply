import { Strategy } from 'passport-jwt';
import { JwtPayload } from '@vibe-apply/shared';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): {
        userId: string;
        email: string;
        role: import("@vibe-apply/shared").UserRole;
        leaderStatus: import("@vibe-apply/shared").LeaderStatus | undefined;
    };
}
export {};
