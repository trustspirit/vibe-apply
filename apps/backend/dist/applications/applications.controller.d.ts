import { ApplicationsService } from './applications.service';
import type { CreateApplicationDto, UpdateApplicationDto, Application, ApplicationStatus, JwtPayload } from '@vibe-apply/shared';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(user: JwtPayload, application: CreateApplicationDto): Promise<Application>;
    findAll(): Promise<Application[]>;
    findMyApplication(user: JwtPayload): Promise<Application | null>;
    findByUserId(userId: string): Promise<Application | null>;
    findOne(id: string): Promise<Application>;
    update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application>;
    updateStatus(id: string, body: {
        status: ApplicationStatus;
    }): Promise<Application>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
