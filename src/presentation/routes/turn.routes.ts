import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/authenticate';
import { config } from '../../config';

interface MeteredCredential {
    apiKey: string;
    username: string;
    password: string;
    expiryInSeconds: number;
}

interface MeteredError {
    error: string;
}

export async function turnRoutes(fastify: FastifyInstance): Promise<void> {
    // Get expiring TURN credentials
    fastify.get('/credentials', { preHandler: authenticate }, async (_request, reply) => {
        const { domain, secretKey } = config.metered;

        if (!secretKey) {
            return reply.status(500).send({ error: 'TURN server not configured' });
        }

        try {
            // Step 1: Create expiring credential (4 hours)
            const createRes = await fetch(
                `https://${domain}/api/v1/turn/credential?secretKey=${secretKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ expiryInSeconds: 14400 }),
                }
            );

            if (!createRes.ok) {
                const err = (await createRes.json()) as MeteredError;
                return reply.status(createRes.status).send({ error: err.error || 'Failed to create TURN credential' });
            }

            const credential = (await createRes.json()) as MeteredCredential;

            // Step 2: Fetch ICE servers using the temporary apiKey
            const iceRes = await fetch(
                `https://${domain}/api/v1/turn/credentials?apiKey=${credential.apiKey}`
            );

            if (!iceRes.ok) {
                const err = (await iceRes.json()) as MeteredError;
                return reply.status(iceRes.status).send({ error: err.error || 'Failed to fetch ICE servers' });
            }

            const iceServers = await iceRes.json();
            return reply.send({ iceServers });
        } catch (error) {
            return reply.status(500).send({ error: 'TURN service unavailable' });
        }
    });
}
