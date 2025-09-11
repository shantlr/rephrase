import { WordingData } from '@/server/data/wording.types';

export type Enums = WordingData['config']['enums'];
export type EnumDefinition = Enums[number];
