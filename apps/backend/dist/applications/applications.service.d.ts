import { FirebaseService } from '../firebase/firebase.service';
import { Application, CreateApplicationDto, UpdateApplicationDto, ApplicationStatus } from '@vibe-apply/shared';
export declare class ApplicationsService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    create(userId: string, createApplicationDto: CreateApplicationDto): Promise<Application>;
    findAll(): Promise<Application[]>;
    findByUserId(userId: string): Promise<Application | null>;
    findOne(id: string): Promise<Application>;
    update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application>;
    updateStatus(id: string, status: ApplicationStatus): Promise<Application>;
    remove(id: string): Promise<void>;
}
