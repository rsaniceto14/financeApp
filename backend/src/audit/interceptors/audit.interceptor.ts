import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Body } from "@nestjs/common";
import path from "path";
import { metadata } from "reflect-metadata/no-conflict";
import { Observable, tap } from "rxjs";
import { AuditService } from "../audit.service";
import { Reflector } from "@nestjs/core";
import { AUDIT_KEY, AuditOptions } from "../decorators/audit.decorators";

@Injectable()
export class AuditInterceptor implements NestInterceptor {

    constructor(private reflector: Reflector,
        private auditService: AuditService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        const auditOptions = this.reflector.getAllAndOverride<AuditOptions>(AUDIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!auditOptions) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return next.handle().pipe(
            tap(async () => {
                await this.auditService.log({
                    action: auditOptions.action,
                    userId: user?.sub,
                    organizationId: user?.orgId,
                    metadata: {
                        path: request.url,
                        method: request.method,
                        body: request.body
                    },

                })
            }),
        )
    }

}

