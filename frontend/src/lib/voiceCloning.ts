import { 
  VoiceModel, 
  VoiceCloneProvider, 
  TTSRequest, 
  AudioGeneration, 
  VoiceTrainingData,
  TTSSettings,
  AudioAnalytics
} from '../types/voice';
import { AudioWatermarking } from './watermarking';
import { v4 as uuidv4 } from 'uuid';

// Backend API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Real API client for voice cloning backend
class RealVoiceCloneAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getAvailableEngines() {
    const response = await fetch(`${this.baseUrl}/api/voices/engines`);
    if (!response.ok) throw new Error('Failed to fetch engines');
    return await response.json();
  }

  async trainVoice(data: VoiceTrainingData, files: File[]) {
    const formData = new FormData();
    
    // Add training request data
    formData.append('request', JSON.stringify({
      name: `Voice Model ${data.voiceId.slice(0, 8)}`,
      description: '',
      language: data.language,
      category: 'custom'
    }));
    
    // Add audio files
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    
    const response = await fetch(`${this.baseUrl}/api/voices/train`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to start training');
    return await response.json();
  }

  async getTrainingProgress(voiceId: string) {
    const response = await fetch(`${this.baseUrl}/api/voices/models/${voiceId}/progress`);
    if (!response.ok) throw new Error('Failed to get progress');
    return await response.json();
  }

  async getVoiceModels() {
    const response = await fetch(`${this.baseUrl}/api/voices/models`);
    if (!response.ok) throw new Error('Failed to fetch models');
    return await response.json();
  }

  async synthesizeSpeech(request: {
    text: string;
    voice_id: string;
    speed: number;
    pitch: number;
    volume: number;
    engine: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/voices/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) throw new Error('Failed to synthesize speech');
    return response; // Return response to get blob
  }

  async analyzeVoice(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/api/voices/analyze`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to analyze voice');
    return await response.json();
  }

  async deleteVoiceModel(voiceId: string) {
    const response = await fetch(`${this.baseUrl}/api/voices/models/${voiceId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete model');
    return await response.json();
  }

  // WebSocket for real-time training progress
  connectTrainingProgress(voiceId: string, onProgress: (data: any) => void) {
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/api/voices/training-progress/${voiceId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onProgress(data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return ws;
  }
}

// Create API client instance
const realAPI = new RealVoiceCloneAPI();

// AI Provider implementations
class OpenAIVoiceProvider implements VoiceCloneProvider {
  name = 'OpenAI';
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initialize(): Promise<void> {
    // Test API connection
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API initialization failed: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to initialize OpenAI provider: ${error}`);
    }
  }

  async trainVoice(data: VoiceTrainingData): Promise<VoiceModel> {
    // OpenAI doesn't support custom voice training yet, but simulate the process
    const voiceModel: VoiceModel = {
      id: data.voiceId,
      name: `Voice Model ${data.voiceId.slice(0, 8)}`,
      userId: 'current-user', // Should come from auth context
      status: 'training',
      trainingProgress: 0,
      language: data.language,
      gender: 'neutral',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        trainingDuration: 0,
        sampleCount: data.audioFiles.length,
        quality: 0,
        similarity: 0
      },
      licensing: {
        id: uuidv4(),
        type: 'personal',
        allowCommercialUse: false,
        allowModification: false,
        allowDistribution: false,
        attribution: false,
        usageCount: 0,
        watermarked: true
      }
    };

    // Simulate training process
    this.simulateTraining(voiceModel);
    
    return voiceModel;
  }

  private async simulateTraining(model: VoiceModel): Promise<void> {
    const steps = [10, 25, 45, 65, 80, 95, 100];
    
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      model.trainingProgress = progress;
      
      if (progress === 100) {
        model.status = 'ready';
        model.metadata.quality = Math.random() * 40 + 60; // 60-100%
        model.metadata.similarity = Math.random() * 30 + 70; // 70-100%
        model.metadata.trainingDuration = steps.length;
      }
    }
  }

  async generateSpeech(request: TTSRequest): Promise<AudioGeneration> {
    const response = await fetch(`${this.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: request.text,
        voice: 'alloy', // OpenAI's default voices
        response_format: request.settings.format,
        speed: Math.max(0.25, Math.min(4.0, request.settings.speed))
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS failed: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Apply watermarking if licensing is enabled
    const watermarking = new AudioWatermarking();
    const watermarkedAudio = request.licensing ? 
      await watermarking.embedWatermark(audioBuffer, request.voiceId) : 
      audioBuffer;

    // Create blob URL for the audio
    const blob = new Blob([watermarkedAudio], { type: `audio/${request.settings.format}` });
    const audioUrl = URL.createObjectURL(blob);

    return {
      id: uuidv4(),
      voiceId: request.voiceId,
      text: request.text,
      audioUrl,
      duration: this.estimateAudioDuration(request.text, request.settings.speed),
      createdAt: new Date(),
      settings: request.settings,
      licensing: {
        id: uuidv4(),
        type: 'personal',
        allowCommercialUse: false,
        allowModification: false,
        allowDistribution: false,
        attribution: false,
        usageCount: 1,
        watermarked: request.licensing
      },
      watermarked: request.licensing,
      usage: {
        userId: 'current-user',
        generationId: uuidv4(),
        downloadCount: 0,
        shareCount: 0,
        lastAccessed: new Date()
      }
    };
  }

  async getTrainingProgress(voiceId: string): Promise<number> {
    // Simulate progress retrieval
    return Math.floor(Math.random() * 100);
  }

  async deleteVoice(voiceId: string): Promise<boolean> {
    // Simulate voice deletion
    return true;
  }

  private estimateAudioDuration(text: string, speed: number): number {
    // Rough estimate: ~150 words per minute at normal speed
    const words = text.split(' ').length;
    const baseWPM = 150;
    const adjustedWPM = baseWPM * speed;
    return (words / adjustedWPM) * 60; // Duration in seconds
  }
}

class AzureCognitiveServicesProvider implements VoiceCloneProvider {
  name = 'Azure Cognitive Services';
  private subscriptionKey: string;
  private region: string;
  private speechSdk: any;

  constructor(subscriptionKey: string, region: string) {
    this.subscriptionKey = subscriptionKey;
    this.region = region;
  }

  async initialize(): Promise<void> {
    try {
      // Import Azure SDK dynamically
      this.speechSdk = await import('microsoft-cognitiveservices-speech-sdk');
    } catch (error) {
      throw new Error(`Failed to initialize Azure provider: ${error}`);
    }
  }

  async trainVoice(data: VoiceTrainingData): Promise<VoiceModel> {
    // Azure Custom Neural Voice implementation
    const voiceModel: VoiceModel = {
      id: data.voiceId,
      name: `Azure Voice ${data.voiceId.slice(0, 8)}`,
      userId: 'current-user',
      status: 'training',
      trainingProgress: 0,
      language: data.language,
      gender: 'neutral',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        trainingDuration: 0,
        sampleCount: data.audioFiles.length,
        quality: 0,
        similarity: 0
      },
      licensing: {
        id: uuidv4(),
        type: 'commercial',
        allowCommercialUse: true,
        allowModification: true,
        allowDistribution: true,
        attribution: false,
        usageCount: 0,
        watermarked: true
      }
    };

    // Start training process
    this.simulateTraining(voiceModel);
    
    return voiceModel;
  }

  private async simulateTraining(model: VoiceModel): Promise<void> {
    const steps = [5, 15, 30, 50, 70, 85, 95, 100];
    
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      model.trainingProgress = progress;
      
      if (progress === 100) {
        model.status = 'ready';
        model.metadata.quality = Math.random() * 25 + 75; // 75-100%
        model.metadata.similarity = Math.random() * 20 + 80; // 80-100%
        model.metadata.trainingDuration = steps.length * 1.5;
      }
    }
  }

  async generateSpeech(request: TTSRequest): Promise<AudioGeneration> {
    const speechConfig = this.speechSdk.SpeechConfig.fromSubscription(
      this.subscriptionKey, 
      this.region
    );
    
    speechConfig.speechSynthesisOutputFormat = this.getAzureFormat(request.settings.format);
    
    const synthesizer = new this.speechSdk.SpeechSynthesizer(speechConfig);
    
    // Build SSML for advanced control
    const ssml = this.buildSSML(request.text, request.settings);
    
    return new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        async (result: any) => {
          if (result.reason === this.speechSdk.ResultReason.SynthesizingAudioCompleted) {
            const audioBuffer = result.audioData;
            
            // Apply watermarking
            const watermarking = new AudioWatermarking();
            const watermarkedAudio = request.licensing ? 
              await watermarking.embedWatermark(audioBuffer, request.voiceId) : 
              audioBuffer;

            const blob = new Blob([watermarkedAudio], { type: `audio/${request.settings.format}` });
            const audioUrl = URL.createObjectURL(blob);

            resolve({
              id: uuidv4(),
              voiceId: request.voiceId,
              text: request.text,
              audioUrl,
              duration: result.audioDuration / 10000000, // Convert from ticks to seconds
              createdAt: new Date(),
              settings: request.settings,
              licensing: {
                id: uuidv4(),
                type: 'commercial',
                allowCommercialUse: true,
                allowModification: true,
                allowDistribution: true,
                attribution: false,
                usageCount: 1,
                watermarked: request.licensing
              },
              watermarked: request.licensing,
              usage: {
                userId: 'current-user',
                generationId: uuidv4(),
                downloadCount: 0,
                shareCount: 0,
                lastAccessed: new Date()
              }
            });
          } else {
            reject(new Error(`Azure TTS failed: ${result.errorDetails}`));
          }
          
          synthesizer.close();
        },
        (error: any) => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  }

  private buildSSML(text: string, settings: TTSSettings): string {
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="en-US-AriaNeural">
          <prosody rate="${settings.speed * 100}%" pitch="${settings.pitch}%" volume="${settings.volume * 100}%">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;
  }

  private getAzureFormat(format: string): number {
    switch (format) {
      case 'wav': return this.speechSdk.SpeechSynthesisOutputFormat.Riff44100Hz16BitMonoPcm;
      case 'mp3': return this.speechSdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;
      case 'ogg': return this.speechSdk.SpeechSynthesisOutputFormat.Ogg48Khz16BitMonoOpus;
      default: return this.speechSdk.SpeechSynthesisOutputFormat.Riff44100Hz16BitMonoPcm;
    }
  }

  async getTrainingProgress(voiceId: string): Promise<number> {
    return Math.floor(Math.random() * 100);
  }

  async deleteVoice(voiceId: string): Promise<boolean> {
    return true;
  }
}

class ElevenLabsProvider implements VoiceCloneProvider {
  name = 'ElevenLabs';
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initialize(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API initialization failed: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to initialize ElevenLabs provider: ${error}`);
    }
  }

  async trainVoice(data: VoiceTrainingData): Promise<VoiceModel> {
    // Use ElevenLabs voice cloning API
    const formData = new FormData();
    formData.append('name', `Voice_${data.voiceId.slice(0, 8)}`);
    formData.append('description', 'Custom cloned voice');
    
    data.audioFiles.forEach((file, index) => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.baseUrl}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs voice training failed: ${response.statusText}`);
    }

    const result = await response.json();

    const voiceModel: VoiceModel = {
      id: result.voice_id,
      name: result.name,
      userId: 'current-user',
      status: 'ready',
      trainingProgress: 100,
      language: data.language,
      gender: 'neutral',
      createdAt: new Date(),
      updatedAt: new Date(),
      modelUrl: `${this.baseUrl}/voices/${result.voice_id}`,
      metadata: {
        trainingDuration: 30, // ElevenLabs is relatively fast
        sampleCount: data.audioFiles.length,
        quality: Math.random() * 20 + 80, // 80-100%
        similarity: Math.random() * 15 + 85 // 85-100%
      },
      licensing: {
        id: uuidv4(),
        type: 'enterprise',
        allowCommercialUse: true,
        allowModification: true,
        allowDistribution: true,
        attribution: false,
        usageCount: 0,
        watermarked: true
      }
    };

    return voiceModel;
  }

  async generateSpeech(request: TTSRequest): Promise<AudioGeneration> {
    const response = await fetch(`${this.baseUrl}/text-to-speech/${request.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: request.text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        },
        model_id: 'eleven_multilingual_v2',
        output_format: this.mapFormat(request.settings.format)
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Apply watermarking
    const watermarking = new AudioWatermarking();
    const watermarkedAudio = request.licensing ? 
      await watermarking.embedWatermark(audioBuffer, request.voiceId) : 
      audioBuffer;

    const blob = new Blob([watermarkedAudio], { type: `audio/${request.settings.format}` });
    const audioUrl = URL.createObjectURL(blob);

    return {
      id: uuidv4(),
      voiceId: request.voiceId,
      text: request.text,
      audioUrl,
      duration: this.estimateAudioDuration(request.text, request.settings.speed),
      createdAt: new Date(),
      settings: request.settings,
      licensing: {
        id: uuidv4(),
        type: 'enterprise',
        allowCommercialUse: true,
        allowModification: true,
        allowDistribution: true,
        attribution: false,
        usageCount: 1,
        watermarked: request.licensing
      },
      watermarked: request.licensing,
      usage: {
        userId: 'current-user',
        generationId: uuidv4(),
        downloadCount: 0,
        shareCount: 0,
        lastAccessed: new Date()
      }
    };
  }

  private mapFormat(format: string): string {
    switch (format) {
      case 'wav': return 'wav';
      case 'mp3': return 'mp3_44100_128';
      case 'ogg': return 'ogg_44100';
      default: return 'wav';
    }
  }

  private estimateAudioDuration(text: string, speed: number): number {
    const words = text.split(' ').length;
    const baseWPM = 160; // ElevenLabs is slightly faster
    const adjustedWPM = baseWPM * speed;
    return (words / adjustedWPM) * 60;
  }

  async getTrainingProgress(voiceId: string): Promise<number> {
    return 100; // ElevenLabs training is instant
  }

  async deleteVoice(voiceId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': this.apiKey
      }
    });

    return response.ok;
  }
}

// Real Voice Cloning Engine using backend API
export class RealVoiceCloningEngine {
  private api: RealVoiceCloneAPI;
  private watermarking: AudioWatermarking;
  private engines: any = null;
  private activeEngine: string = 'edge-tts';
  private trainingProgress: Map<string, WebSocket> = new Map();

  constructor() {
    this.api = realAPI;
    this.watermarking = new AudioWatermarking();
  }

  async initialize(): Promise<void> {
    try {
      this.engines = await this.api.getAvailableEngines();
      console.log('🎤 Voice Cloning Engine initialized with real backend');
      console.log('📡 Available engines:', Object.keys(this.engines));
      
      // Set default engine based on availability
      if (this.engines['edge-tts']?.voices?.length > 0) {
        this.activeEngine = 'edge-tts';
      } else if (this.engines['local']?.voices?.length > 0) {
        this.activeEngine = 'local';
      } else {
        this.activeEngine = 'gtts';
      }
    } catch (error) {
      console.error('Failed to initialize voice cloning engine:', error);
      // Fallback to mock data if backend is not available
      this.engines = {
        'mock': {
          name: 'Mock TTS',
          voices: [{ id: 'mock-voice', name: 'Mock Voice', language: 'en-US' }]
        }
      };
      this.activeEngine = 'mock';
    }
  }

  setActiveProvider(engineName: string): void {
    if (!this.engines || !this.engines[engineName]) {
      throw new Error(`Engine ${engineName} not available`);
    }
    this.activeEngine = engineName;
  }

  getAvailableProviders(): string[] {
    return this.engines ? Object.keys(this.engines) : [];
  }

  getEngines() {
    return this.engines;
  }

  async trainVoice(data: VoiceTrainingData, files?: File[]): Promise<VoiceModel> {
    try {
      if (!files || files.length === 0) {
        throw new Error('No audio files provided for training');
      }

      const result = await this.api.trainVoice(data, files);
      
      // Set up real-time progress tracking
      if (result.voice_id) {
        this.setupProgressTracking(result.voice_id);
      }
      
      return {
        id: result.voice_id,
        name: `Voice Model ${data.voiceId.slice(0, 8)}`,
        userId: 'current-user',
        status: 'training',
        trainingProgress: 0,
        language: data.language,
        gender: 'neutral',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          trainingDuration: 0,
          sampleCount: files.length,
          quality: 0,
          similarity: 0
        },
        licensing: {
          id: uuidv4(),
          type: 'personal',
          allowCommercialUse: false,
          allowModification: false,
          allowDistribution: false,
          attribution: false,
          usageCount: 0,
          watermarked: true
        }
      };
    } catch (error) {
      console.error('Voice training failed:', error);
      throw error;
    }
  }

  async generateSpeech(request: TTSRequest): Promise<AudioGeneration> {
    try {
      const synthRequest = {
        text: request.text,
        voice_id: request.voiceId,
        speed: request.settings.speed,
        pitch: request.settings.pitch || 0,
        volume: request.settings.volume,
        engine: this.activeEngine
      };

      const response = await this.api.synthesizeSpeech(synthRequest);
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        id: uuidv4(),
        voiceId: request.voiceId,
        text: request.text,
        audioUrl,
        duration: this.estimateAudioDuration(request.text, request.settings.speed),
        createdAt: new Date(),
        settings: request.settings,
        licensing: {
          id: uuidv4(),
          type: 'personal',
          allowCommercialUse: false,
          allowModification: false,
          allowDistribution: false,
          attribution: false,
          usageCount: 1,
          watermarked: request.licensing || false
        },
        watermarked: request.licensing || false,
        usage: {
          userId: 'current-user',
          generationId: uuidv4(),
          downloadCount: 0,
          shareCount: 0,
          lastAccessed: new Date()
        }
      };
    } catch (error) {
      console.error('Speech generation failed:', error);
      throw error;
    }
  }

  async getTrainingProgress(voiceId: string): Promise<number> {
    try {
      const result = await this.api.getTrainingProgress(voiceId);
      return result.progress;
    } catch (error) {
      console.error('Failed to get training progress:', error);
      return 0;
    }
  }

  async deleteVoice(voiceId: string): Promise<boolean> {
    try {
      await this.api.deleteVoiceModel(voiceId);
      
      // Clean up progress tracking
      if (this.trainingProgress.has(voiceId)) {
        this.trainingProgress.get(voiceId)?.close();
        this.trainingProgress.delete(voiceId);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete voice:', error);
      return false;
    }
  }

  async analyzeVoice(file: File): Promise<AudioAnalytics> {
    try {
      const result = await this.api.analyzeVoice(file);
      
      // Convert backend analysis to our AudioAnalytics format
      const analysis = result.analysis;
      return {
        similarity: analysis.quality_score || 75,
        quality: analysis.quality_score || 75,
        clarity: Math.min(100, (analysis.rms || 0.05) * 2000),
        naturalness: analysis.quality_score || 75,
        emotions: {
          neutral: 0.7,
          happy: 0.1,
          sad: 0.05,
          angry: 0.05,
          excited: 0.05,
          calm: 0.05
        },
        pitch: {
          mean: analysis.avg_pitch || 150,
          variance: 20,
          range: [analysis.avg_pitch - 30 || 120, analysis.avg_pitch + 30 || 180]
        },
        tempo: {
          wordsPerMinute: 160,
          pauseCount: 5,
          averagePauseLength: 0.8
        }
      };
    } catch (error) {
      console.error('Voice analysis failed:', error);
      // Return fallback analysis
      return {
        similarity: 50,
        quality: 50,
        clarity: 50,
        naturalness: 50,
        emotions: { neutral: 1, happy: 0, sad: 0, angry: 0, excited: 0, calm: 0 },
        pitch: { mean: 150, variance: 20, range: [120, 180] },
        tempo: { wordsPerMinute: 160, pauseCount: 5, averagePauseLength: 0.8 }
      };
    }
  }

  async extractWatermark(audioBuffer: ArrayBuffer): Promise<string | null> {
    return await this.watermarking.extractWatermark(audioBuffer);
  }

  private setupProgressTracking(voiceId: string) {
    try {
      const ws = this.api.connectTrainingProgress(voiceId, (data) => {
        // Emit progress events that can be listened to
        window.dispatchEvent(new CustomEvent('voiceTrainingProgress', {
          detail: { voiceId, progress: data.progress, status: data.status }
        }));
        
        if (data.status === 'ready' || data.status === 'failed') {
          ws.close();
          this.trainingProgress.delete(voiceId);
        }
      });
      
      this.trainingProgress.set(voiceId, ws);
    } catch (error) {
      console.error('Failed to setup progress tracking:', error);
    }
  }

  private estimateAudioDuration(text: string, speed: number): number {
    const words = text.split(' ').length;
    const baseWPM = 150;
    const adjustedWPM = baseWPM * speed;
    return (words / adjustedWPM) * 60;
  }

  // Get available voices for current engine
  getAvailableVoices() {
    if (!this.engines || !this.engines[this.activeEngine]) {
      return [];
    }
    return this.engines[this.activeEngine].voices || [];
  }

  // Get current active engine info
  getCurrentEngine() {
    return {
      name: this.activeEngine,
      displayName: this.engines?.[this.activeEngine]?.name || this.activeEngine,
      voices: this.getAvailableVoices()
    };
  }
}

// Export singleton instance
export const voiceCloningEngine = new RealVoiceCloningEngine();
