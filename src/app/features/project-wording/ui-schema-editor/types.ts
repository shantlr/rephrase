import { WordingData } from '@/server/data/wording.types';

export type Schema = WordingData['config']['schema'];
export type SchemaField = WordingData['config']['schema']['fields'][number];
