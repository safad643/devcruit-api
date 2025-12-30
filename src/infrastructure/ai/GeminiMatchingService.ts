import { injectable } from 'inversify';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { IAIMatchingService, MatchResult } from '../../application/services/IAIMatchingService';
import { Job } from '../../domain/entities/Job';
import { DeveloperProfile } from '../../domain/entities/DeveloperProfile';
import { config } from '../../config';

const SYSTEM_INSTRUCTION = `You are an expert technical recruiter with deep knowledge of software development technologies and roles. Your job is to evaluate how well a candidate matches a job posting.

IMPORTANT RULES:
- Consider that similar technologies are equivalent (e.g., "ReactJS" = "React", "Node" = "NodeJS", "Postgres" = "PostgreSQL", "JS" = "JavaScript")
- Evaluate both hard skills (tech stack) and soft skills
- Consider work arrangement and job type preference alignment
- Factor in experience level and years of experience
- Consider salary expectations vs offered compensation when both are available`;

const RESPONSE_SCHEMA = {
    type: SchemaType.OBJECT as const,
    properties: {
        score: {
            type: SchemaType.NUMBER as const,
            description: 'Match score from 0 to 100',
        },
        reason: {
            type: SchemaType.STRING as const,
            description: 'Brief 1-2 sentence summary explaining the score',
        },
    },
    required: ['score', 'reason'] as string[],
};

@injectable()
export class GeminiMatchingService implements IAIMatchingService {
    private readonly _genAI: GoogleGenerativeAI;
    private readonly _model;

    constructor() {
        this._genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this._model = this._genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: RESPONSE_SCHEMA,
            },
        });
    }

    async getMatchScore(job: Job, candidate: DeveloperProfile): Promise<MatchResult> {
        const prompt = this._buildPrompt(job, candidate);

        try {
            const result = await this._model.generateContent(prompt);
            const responseText = result.response.text();
            const parsed = JSON.parse(responseText);
            const score = Math.round(Math.min(100, Math.max(0, Number(parsed.score))));

            return {
                score,
                shouldShortlist: score >= 70,
                reason: parsed.reason || 'No reason provided',
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            return {
                score: 50,
                shouldShortlist: false,
                reason: 'AI matching unavailable',
            };
        }
    }

    private _buildPrompt(job: Job, candidate: DeveloperProfile): string {
        return `Evaluate how well this candidate matches the job posting.

JOB DETAILS:
- Title: ${job.title}
- Category: ${job.category}
- Description: ${job.description}
- Required Tech: ${job.requiredTech.join(', ')}
- Required Skills: ${job.requiredSkills.join(', ')}
- Nice-to-have Tech: ${job.niceTech.join(', ')}
- Nice-to-have Skills: ${job.niceSkills.join(', ')}
- Experience Level: ${job.experienceLevel}
- Minimum Years: ${job.minYears}
- Job Type: ${job.jobType}
- Work Arrangement: ${job.workArrangement}
- Location: ${job.location || 'Not specified'}
- Relocation Offered: ${job.relocation ? 'Yes' : 'No'}
- Compensation: ${this._formatCompensation(job)}

CANDIDATE PROFILE:
- Bio: ${candidate.bio}
- Tech Stack: ${candidate.techs.join(', ')}
- Skills: ${candidate.skills.join(', ')}
- Years of Experience: ${candidate.yearsExperience}
- Seniority Level: ${candidate.seniorityLevel}
- Job Type Preferences: ${candidate.jobTypePreferences.join(', ')}
- Work Arrangement Preferences: ${candidate.workArrangement.join(', ')}
- Willing to Relocate: ${candidate.willingToRelocate ? 'Yes' : 'No'}
- Desired Salary: ${candidate.desiredSalary ? `$${candidate.desiredSalary}` : 'Not specified'}

WORK HISTORY:
${this._formatWorkHistory(candidate)}

EDUCATION:
${this._formatEducation(candidate)}

PROJECTS:
${this._formatProjects(candidate)}

SCORING CRITERIA:
1. Technical Skills Match (40%): How well do the candidate's techs match required and nice-to-have tech?
2. Soft Skills Match (15%): How well do skills match?
3. Experience Match (20%): Does experience level and years meet requirements?
4. Preference Alignment (25%): Job type, work arrangement, location/relocation, salary expectations

Return the match score.`;
    }

    private _formatCompensation(job: Job): string {
        if (job.compensation.mode === 'hidden') return 'Hidden';
        if (job.compensation.min && job.compensation.max) {
            return `${job.compensation.currency || 'USD'} ${job.compensation.min} - ${job.compensation.max}`;
        }
        return 'Not specified';
    }

    private _formatWorkHistory(candidate: DeveloperProfile): string {
        if (!candidate.workHistory.length) return 'No work history provided';
        return candidate.workHistory.map(h =>
            `- ${h.positionTitle} at ${h.companyName} (${h.startDate} - ${h.endDate || 'Present'}): ${h.description}. Tech: ${h.technologiesUsed.join(', ')}`
        ).join('\n');
    }

    private _formatEducation(candidate: DeveloperProfile): string {
        if (!candidate.education.length) return 'No education provided';
        return candidate.education.map(e =>
            `- ${e.degreeType} in ${e.fieldOfStudy} from ${e.institution} (${e.graduationYear || 'N/A'})`
        ).join('\n');
    }

    private _formatProjects(candidate: DeveloperProfile): string {
        if (!candidate.projects.length) return 'No projects provided';
        return candidate.projects.map(p =>
            `- ${p.name}: ${p.description}. Role: ${p.roleInProject}. Tech: ${p.techStack.join(', ')}`
        ).join('\n');
    }
}
