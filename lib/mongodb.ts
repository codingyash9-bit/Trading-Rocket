import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let isConnected = false;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then(() => {
      isConnected = true;
      console.log('[MongoDB] Connected successfully');
      return client;
    }).catch((err) => {
      console.warn('[MongoDB] Connection failed, continuing without DB:', err.message);
      return client;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then(() => {
    isConnected = true;
    return client;
  }).catch((err) => {
    console.warn('[MongoDB] Connection failed, continuing without DB:', err.message);
    return client;
  });
}

export async function getDatabase(): Promise<Db> {
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(process.env.MONGODB_DB || 'aether_db');
  } catch {
    throw new Error('MongoDB not available');
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}

export default clientPromise;
