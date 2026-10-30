export interface VoiceModel {
  id: string;
  name: string;
  description?: string;
  userId: string;
  status: 'training' | 'ready' | 'failed' | 'pending';
  trainingProgress: number;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  accent?: string;
  createdAt: Date;
  updatedAt: Date;
  sampleAudioUrl?: string;
  modelUrl?: string;
  metadata: {
    trainingDuration: number;
    sampleCount: number;
    quality: number;
    similarity: number;
  };
  licensing: VoiceLicense;
}

export interface VoiceLicense {
  id: string;
  type: 'personal' | 'commercial' | 'enterprise';
  allowCommercialUse: boolean;
  allowModification: boolean;
  allowDistribution: boolean;
  attribution: boolean;
  expiresAt?: Date;
  usageCount: number;
  maxUsageCount?: number;
  watermarked: boolean;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  settings: TTSSettings;
  licensing: boolean;
}

export interface TTSSettings {
  speed: number; // 0.25 to 4.0
  pitch: number; // -20 to 20
  volume: number; // 0 to 1
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'calm';
  pronunciation?: 'standard' | 'precise' | 'casual';
  format: 'wav' | 'mp3' | 'ogg';
  sampleRate: 16000 | 22050 | 44100 | 48000;
  bitrate?: 128 | 192 | 256 | 320;
}

export interface AudioGeneration {
  id: string;
  voiceId: string;
  text: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
  settings: TTSSettings;
  licensing: VoiceLicense;
  watermarked: boolean;
  usage: AudioUsage;
}

export interface AudioUsage {
  userId: string;
  generationId: string;
  downloadCount: number;
  shareCount: number;
  lastAccessed: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface VoiceTrainingData {
  voiceId: string;
  audioFiles: File[];
  transcripts: string[];
  language: string;
  settings: TrainingSettings;
}

export interface TrainingSettings {
  epochs: number;
  batchSize: number;
  learningRate: number;
  dataAugmentation: boolean;
  qualityThreshold: number;
  autoStopEarly: boolean;
}

export interface VoiceCloneProvider {
  name: string;
  initialize(): Promise<void>;
  trainVoice(data: VoiceTrainingData): Promise<VoiceModel>;
  generateSpeech(request: TTSRequest): Promise<AudioGeneration>;
  getTrainingProgress(voiceId: string): Promise<number>;
  deleteVoice(voiceId: string): Promise<boolean>;
}

export interface WatermarkOptions {
  type: 'invisible' | 'audible';
  strength: number; // 0-100
  payload: string;
  method: 'spectral' | 'temporal' | 'echo' | 'lsb';
}

export interface AudioAnalytics {
  similarity: number;
  quality: number;
  clarity: number;
  naturalness: number;
  emotions: Record<string, number>;
  pitch: {
    mean: number;
    variance: number;
    range: [number, number];
  };
  tempo: {
    wordsPerMinute: number;
    pauseCount: number;
    averagePauseLength: number;
  };
}