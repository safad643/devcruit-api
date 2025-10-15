import { MongoClient, Db } from 'mongodb';
import { config } from '../../../config';

let client: MongoClient;
let db: Db;

export async function connectMongoDB(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(config.mongodb.uri);
  await client.connect();
  db = client.db(config.mongodb.dbName);

  console.log('MongoDB connected');
  return db;
}

export function getMongoDb(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return db;
}

export async function disconnectMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB disconnected');
  }
}
