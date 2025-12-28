import { getMongoDb } from './client';

export async function ensureIndexes() {
    const db = getMongoDb();

    console.log('Ensuring database indexes...');

    try {
        // Plans
        await db.collection('plans').createIndex({ name: 1 }, { unique: true });
        await db.collection('plans').createIndex({ displayOrder: 1 });

        // Payment Transactions
        await db.collection('payment_transactions').createIndex({ userId: 1 });
        await db.collection('payment_transactions').createIndex({ companyId: 1 });
        await db.collection('payment_transactions').createIndex({ stripeSessionId: 1 }, { unique: true });

        // Job Fields
        await db.collection('job_fields').createIndex({ type: 1, name: 1 }, { unique: true });

        console.log('Database indexes ensured successfully');
    } catch (error) {
        console.error('Error ensuring database indexes:', error);
        throw error;
    }
}
