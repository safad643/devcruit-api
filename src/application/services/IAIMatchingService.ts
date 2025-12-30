import { Job } from '../../domain/entities/Job';
import { DeveloperProfile } from '../../domain/entities/DeveloperProfile';

export interface MatchResult {
    score: number; // 0-100
    shouldShortlist: boolean;
    reason: string; // AI-generated summary of why this score was given
}

export interface IAIMatchingService {
    getMatchScore(job: Job, candidate: DeveloperProfile): Promise<MatchResult>;
}
