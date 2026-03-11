import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../types/jwt-payload";

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest()

    return request.user
},
)