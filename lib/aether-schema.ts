import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface AetherExperiment {
  _id?: ObjectId | string;
  systemName: string;
  theoreticalFramework: string;
  targetApplication: string;
  imagesProcessed: number;
  analysis: {
    systemSummary: {
      name: string;
      plausibilityScore: number;
      physicsCategory: string;
    };
    multiFacetedAnalysis: {
      schematicObservations: string;
      emFieldAnomalies: string;
      gravimetricIntegrity: string;
      powerCurveAnalysis: string;
    };
    combinedInsight: {
      mechanismOfAction: string;
      conflictDetection: string;
    };
    engineeringStrategy: {
      currentViability: string;
      materialConstraints: string;
      energyRequirements: string;
    };
    riskAnalysis: {
      hazards: string;
      catastrophicScenarios: string;
    };
    explanation: string;
  };
  rawResponse?: string;
  timestamp: string;
}

export async function saveAetherExperiment(experiment: Omit<AetherExperiment, '_id'>): Promise<string> {
  const db = await getDatabase();
  const result = await db.collection('aetherExperiments').insertOne(experiment);
  return result.insertedId.toString();
}

export async function getAetherExperiments(limit = 50): Promise<AetherExperiment[]> {
  const db = await getDatabase();
  const cursor = db.collection<AetherExperiment>('aetherExperiments')
    .find({}, { sort: { timestamp: -1 }, limit });
  return cursor.toArray();
}

export async function getAetherExperimentById(id: string): Promise<AetherExperiment | null> {
  const db = await getDatabase();
  try {
    return db.collection<AetherExperiment>('aetherExperiments').findOne({ _id: new ObjectId(id) });
  } catch {
    return db.collection<AetherExperiment>('aetherExperiments').findOne({ _id: id });
  }
}