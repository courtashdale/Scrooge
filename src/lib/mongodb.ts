import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!(global as unknown as { _mongoClientPromise: Promise<MongoClient> })._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as unknown as { _mongoClientPromise: Promise<MongoClient> })._mongoClientPromise = client.connect();
  }
  clientPromise = (global as unknown as { _mongoClientPromise: Promise<MongoClient> })._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('scrooge');
}

export default clientPromise;