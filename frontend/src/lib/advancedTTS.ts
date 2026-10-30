import { TTSSettings, AudioGeneration, VoiceModel } from '../types/voice';
import { voiceCloningEngine } from './voiceCloning';
import { AudioWatermarking } from './watermarking';
import { v4 as uuidv4 } from 'uuid';

export interface AudioEffect {
  type: 'reverb' | 'echo' | 'chorus' | 'distortion' | 'pitch_shift' | 'time_stretch' | 'noise_gate' | 'compressor';
  intensity: number; // 0-100
  parameters: Record<string, number>;
}

export interface VoiceMixSettings {
  primaryVoiceId: string;
  secondaryVoiceId: string;
  mixRatio: number; // 0-100, where 0 is all primary, 100 is all secondary
  crossfadeTime: number; // in seconds
  mode: 'blend' | 'morph' | 'alternate' | 'layered';
}

export interface BatchGenerationRequest {
  id: string;
  texts: string[];
  voiceId: string;
  settings: TTSSettings;
  effects?: AudioEffect[];
  outputFormat: 'individual' | 'concatenated' | 'playlist';
  naming: {
    prefix: string;
    includeIndex: boolean;
    includeTimestamp: boolean;
  };
}

export interface BatchGenerationResult {
  id: string;
  totalItems: number;
  completedItems: number;
  progress: number; // 0-100
  outputs: AudioGeneration[];
  errors: string[];
  estimatedTimeRemaining: number; // in seconds
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
}

export interface EmotionSettings {
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'calm' | 'surprised' | 'fearful';
  intensity: number; // 0-100
  transitionSmooth: boolean;
}

export interface PronunciationRule {
  word: string;
  phonetic: string;
  emphasis?: 'weak' | 'normal' | 'strong';
  pauseBefore?: number; // in milliseconds
  pauseAfter?: number; // in milliseconds
}

export class AdvancedTTSEngine {
  private audioContext: AudioContext;
  private watermarking: AudioWatermarking;
  private batchJobs = new Map<string, BatchJob>();
  private effectProcessors = new Map<string, AudioEffectProcessor>();

  constructor() {
    this.audioContext = new AudioContext();
    this.watermarking = new AudioWatermarking();
    this.initializeEffectProcessors();
  }

  /**
   * Generate speech with advanced features
   */
  async generateAdvancedSpeech(
    text: string,
    voiceId: string,
    settings: TTSSettings,
    options: {
      effects?: AudioEffect[];
      emotion?: EmotionSettings;
      pronunciationRules?: PronunciationRule[];
      voiceMix?: VoiceMixSettings;
      enableWatermarking?: boolean;
    } = {}
  ): Promise<AudioGeneration> {
    try {
      // Process text with pronunciation rules
      const processedText = this.applyPronunciationRules(text, options.pronunciationRules || []);
      
      // Apply emotional modifications to settings
      const emotionalSettings = this.applyEmotionalSettings(settings, options.emotion);
      
      let audioGeneration: AudioGeneration;

      if (options.voiceMix) {
        // Generate mixed voice audio
        audioGeneration = await this.generateMixedVoice(processedText, options.voiceMix, emotionalSettings);
      } else {
        // Standard voice generation
        audioGeneration = await voiceCloningEngine.generateSpeech({
          text: processedText,
          voiceId,
          settings: emotionalSettings,
          licensing: options.enableWatermarking || false
        });
      }

      // Apply audio effects
      if (options.effects && options.effects.length > 0) {
        audioGeneration = await this.applyAudioEffects(audioGeneration, options.effects);
      }

      return audioGeneration;
    } catch (error) {
      console.error('Advanced TTS generation failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Advanced TTS generation failed: ${message}`);
    }
  }

  /**
   * Start batch generation
   */
  async startBatchGeneration(
    request: BatchGenerationRequest,
    onProgress?: (result: BatchGenerationResult) => void
  ): Promise<string> {
    if (this.batchJobs.has(request.id)) {
      throw new Error('Batch job with this ID already exists');
    }

    const job = new BatchJob(request, this, onProgress);
    this.batchJobs.set(request.id, job);
    
    // Start processing asynchronously
    job.start();
    
    return request.id;
  }

  /**
   * Get batch generation progress
   */
  getBatchProgress(batchId: string): BatchGenerationResult | null {
    const job = this.batchJobs.get(batchId);
    return job?.getProgress() || null;
  }

  /**
   * Cancel batch generation
   */
  async cancelBatchGeneration(batchId: string): Promise<boolean> {
    const job = this.batchJobs.get(batchId);
    if (!job) {
      return false;
    }

    job.cancel();
    this.batchJobs.delete(batchId);
    return true;
  }

  /**
   * Generate speech with voice morphing between two voices
   */
  async generateMorphedVoice(
    text: string,
    fromVoiceId: string,
    toVoiceId: string,
    morphDuration: number, // in seconds
    settings: TTSSettings
  ): Promise<AudioGeneration> {
    try {
      // Generate audio with both voices
      const fromGeneration = await voiceCloningEngine.generateSpeech({
        text,
        voiceId: fromVoiceId,
        settings,
        licensing: false
      });

      const toGeneration = await voiceCloningEngine.generateSpeech({
        text,
        voiceId: toVoiceId,
        settings,
        licensing: false
      });

      // Create morphed audio
      const morphedAudio = await this.createMorphedAudio(
        fromGeneration.audioUrl,
        toGeneration.audioUrl,
        morphDuration
      );

      return {
        id: uuidv4(),
        voiceId: `${fromVoiceId}-${toVoiceId}-morph`,
        text,
        audioUrl: morphedAudio,
        duration: Math.max(fromGeneration.duration, toGeneration.duration),
        createdAt: new Date(),
        settings,
        licensing: fromGeneration.licensing,
        watermarked: false,
        usage: {
          userId: 'current-user',
          generationId: uuidv4(),
          downloadCount: 0,
          shareCount: 0,
          lastAccessed: new Date()
        }
      };
    } catch (error) {
      console.error('Voice morphing failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Voice morphing failed: ${message}`);
    }
  }

  /**
   * Create audio playlist with multiple voices and effects
   */
  async createAudioPlaylist(
    segments: Array<{
      text: string;
      voiceId: string;
      settings: TTSSettings;
      effects?: AudioEffect[];
      emotion?: EmotionSettings;
      pauseAfter?: number; // in seconds
    }>
  ): Promise<AudioGeneration> {
    try {
      const audioSegments: string[] = [];
      let totalDuration = 0;
      
      for (const segment of segments) {
        const generation = await this.generateAdvancedSpeech(
          segment.text,
          segment.voiceId,
          segment.settings,
          {
            effects: segment.effects,
            emotion: segment.emotion
          }
        );
        
        audioSegments.push(generation.audioUrl);
        totalDuration += generation.duration + (segment.pauseAfter || 0);
      }

      // Concatenate audio segments
      const concatenatedAudio = await this.concatenateAudio(audioSegments);

      return {
        id: uuidv4(),
        voiceId: 'playlist',
        text: segments.map(s => s.text).join(' '),
        audioUrl: concatenatedAudio,
        duration: totalDuration,
        createdAt: new Date(),
        settings: segments[0]?.settings || {
          speed: 1.0,
          pitch: 0,
          volume: 1.0,
          format: 'mp3',
          sampleRate: 44100
        },
        licensing: {
          id: uuidv4(),
          type: 'personal',
          allowCommercialUse: false,
          allowModification: false,
          allowDistribution: false,
          attribution: false,
          usageCount: 1,
          watermarked: false
        },
        watermarked: false,
        usage: {
          userId: 'current-user',
          generationId: uuidv4(),
          downloadCount: 0,
          shareCount: 0,
          lastAccessed: new Date()
        }
      };
    } catch (error) {
      console.error('Playlist creation failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Playlist creation failed: ${message}`);
    }
  }

  /**
   * Apply real-time voice effects during playback
   */
  createRealtimeEffectsNode(effects: AudioEffect[]): AudioNode {
    const effectsChain = this.audioContext.createGain();
    let currentNode: AudioNode = effectsChain;

    for (const effect of effects) {
      const processor = this.effectProcessors.get(effect.type);
      if (processor) {
        const effectNode = processor.createNode(this.audioContext, effect);
        currentNode.connect(effectNode);
        currentNode = effectNode;
      }
    }

    return effectsChain;
  }

  // Private methods

  private initializeEffectProcessors(): void {
    this.effectProcessors.set('reverb', new ReverbProcessor());
    this.effectProcessors.set('echo', new EchoProcessor());
    this.effectProcessors.set('chorus', new ChorusProcessor());
    this.effectProcessors.set('distortion', new DistortionProcessor());
    this.effectProcessors.set('pitch_shift', new PitchShiftProcessor());
    this.effectProcessors.set('time_stretch', new TimeStretchProcessor());
    this.effectProcessors.set('noise_gate', new NoiseGateProcessor());
    this.effectProcessors.set('compressor', new CompressorProcessor());
  }

  private applyPronunciationRules(text: string, rules: PronunciationRule[]): string {
    let processedText = text;
    
    for (const rule of rules) {
      const regex = new RegExp(`\\b${rule.word}\\b`, 'gi');
      let replacement = rule.phonetic;
      
      // Add SSML-like tags for pauses and emphasis
      if (rule.pauseBefore) {
        replacement = `<break time="${rule.pauseBefore}ms"/>${replacement}`;
      }
      if (rule.pauseAfter) {
        replacement = `${replacement}<break time="${rule.pauseAfter}ms"/>`;
      }
      if (rule.emphasis && rule.emphasis !== 'normal') {
        replacement = `<emphasis level="${rule.emphasis}">${replacement}</emphasis>`;
      }
      
      processedText = processedText.replace(regex, replacement);
    }
    
    return processedText;
  }

  private applyEmotionalSettings(settings: TTSSettings, emotion?: EmotionSettings): TTSSettings {
    if (!emotion) return settings;
    
    const emotionalSettings = { ...settings };
    const intensity = emotion.intensity / 100;
    
    switch (emotion.emotion) {
      case 'happy':
        emotionalSettings.speed *= (1 + intensity * 0.2);
        emotionalSettings.pitch += intensity * 15;
        break;
      case 'sad':
        emotionalSettings.speed *= (1 - intensity * 0.3);
        emotionalSettings.pitch -= intensity * 20;
        break;
      case 'angry':
        emotionalSettings.speed *= (1 + intensity * 0.3);
        emotionalSettings.pitch += intensity * 25;
        emotionalSettings.volume *= (1 + intensity * 0.2);
        break;
      case 'excited':
        emotionalSettings.speed *= (1 + intensity * 0.4);
        emotionalSettings.pitch += intensity * 20;
        break;
      case 'calm':
        emotionalSettings.speed *= (1 - intensity * 0.2);
        emotionalSettings.pitch -= intensity * 10;
        break;
      case 'surprised':
        emotionalSettings.pitch += intensity * 30;
        break;
      case 'fearful':
        emotionalSettings.speed *= (1 + intensity * 0.2);
        emotionalSettings.pitch += intensity * 15;
        emotionalSettings.volume *= (1 - intensity * 0.1);
        break;
    }
    
    return emotionalSettings;
  }

  private async generateMixedVoice(
    text: string,
    mixSettings: VoiceMixSettings,
    settings: TTSSettings
  ): Promise<AudioGeneration> {
    // Generate audio with both voices
    const primaryGeneration = await voiceCloningEngine.generateSpeech({
      text,
      voiceId: mixSettings.primaryVoiceId,
      settings,
      licensing: false
    });

    const secondaryGeneration = await voiceCloningEngine.generateSpeech({
      text,
      voiceId: mixSettings.secondaryVoiceId,
      settings,
      licensing: false
    });

    // Mix the audio based on settings
    const mixedAudio = await this.mixAudioSources(
      primaryGeneration.audioUrl,
      secondaryGeneration.audioUrl,
      mixSettings
    );

    return {
      id: uuidv4(),
      voiceId: `${mixSettings.primaryVoiceId}-${mixSettings.secondaryVoiceId}-mix`,
      text,
      audioUrl: mixedAudio,
      duration: Math.max(primaryGeneration.duration, secondaryGeneration.duration),
      createdAt: new Date(),
      settings,
      licensing: primaryGeneration.licensing,
      watermarked: false,
      usage: {
        userId: 'current-user',
        generationId: uuidv4(),
        downloadCount: 0,
        shareCount: 0,
        lastAccessed: new Date()
      }
    };
  }

  private async applyAudioEffects(
    generation: AudioGeneration,
    effects: AudioEffect[]
  ): Promise<AudioGeneration> {
    try {
      // Load audio into AudioBuffer
      const response = await fetch(generation.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Apply effects sequentially
      let processedBuffer = audioBuffer;
      for (const effect of effects) {
        const processor = this.effectProcessors.get(effect.type);
        if (processor) {
          processedBuffer = await processor.processAudio(processedBuffer, effect, this.audioContext);
        }
      }

      // Convert back to blob URL
      const processedAudioUrl = await this.audioBufferToBlobUrl(processedBuffer, generation.settings.format);

      return {
        ...generation,
        audioUrl: processedAudioUrl,
        id: uuidv4() // New ID for processed audio
      };
    } catch (error) {
      console.error('Audio effects processing failed:', error);
      return generation; // Return original if processing fails
    }
  }

  private async mixAudioSources(
    primaryUrl: string,
    secondaryUrl: string,
    mixSettings: VoiceMixSettings
  ): Promise<string> {
    try {
      // Load both audio sources
      const [primaryResponse, secondaryResponse] = await Promise.all([
        fetch(primaryUrl),
        fetch(secondaryUrl)
      ]);

      const [primaryBuffer, secondaryBuffer] = await Promise.all([
        this.audioContext.decodeAudioData(await primaryResponse.arrayBuffer()),
        this.audioContext.decodeAudioData(await secondaryResponse.arrayBuffer())
      ]);

      // Create mixed buffer
      const maxLength = Math.max(primaryBuffer.length, secondaryBuffer.length);
      const mixedBuffer = this.audioContext.createBuffer(
        primaryBuffer.numberOfChannels,
        maxLength,
        primaryBuffer.sampleRate
      );

      // Mix audio based on mode
      for (let channel = 0; channel < mixedBuffer.numberOfChannels; channel++) {
        const mixedData = mixedBuffer.getChannelData(channel);
        const primaryData = primaryBuffer.getChannelData(channel);
        const secondaryData = secondaryBuffer.getChannelData(channel);

        switch (mixSettings.mode) {
          case 'blend':
            this.blendAudio(mixedData, primaryData, secondaryData, mixSettings.mixRatio / 100);
            break;
          case 'morph':
            this.morphAudio(mixedData, primaryData, secondaryData, mixSettings.crossfadeTime, primaryBuffer.sampleRate);
            break;
          case 'alternate':
            this.alternateAudio(mixedData, primaryData, secondaryData, mixSettings.crossfadeTime, primaryBuffer.sampleRate);
            break;
          case 'layered':
            this.layerAudio(mixedData, primaryData, secondaryData, mixSettings.mixRatio / 100);
            break;
        }
      }

      return await this.audioBufferToBlobUrl(mixedBuffer, 'mp3');
    } catch (error) {
      console.error('Audio mixing failed:', error);
      throw new Error('Audio mixing failed');
    }
  }

  private blendAudio(output: Float32Array, primary: Float32Array, secondary: Float32Array, ratio: number): void {
    const primaryWeight = 1 - ratio;
    const secondaryWeight = ratio;

    for (let i = 0; i < output.length; i++) {
      const primarySample = i < primary.length ? primary[i] : 0;
      const secondarySample = i < secondary.length ? secondary[i] : 0;
      output[i] = primarySample * primaryWeight + secondarySample * secondaryWeight;
    }
  }

  private morphAudio(output: Float32Array, primary: Float32Array, secondary: Float32Array, crossfadeTime: number, sampleRate: number): void {
    const crossfadeSamples = crossfadeTime * sampleRate;
    const totalSamples = output.length;

    for (let i = 0; i < output.length; i++) {
      const primarySample = i < primary.length ? primary[i] : 0;
      const secondarySample = i < secondary.length ? secondary[i] : 0;

      let weight = 0;
      if (i < crossfadeSamples) {
        weight = i / crossfadeSamples;
      } else if (i > totalSamples - crossfadeSamples) {
        weight = (totalSamples - i) / crossfadeSamples;
      } else {
        weight = 1;
      }

      output[i] = primarySample * (1 - weight) + secondarySample * weight;
    }
  }

  private alternateAudio(output: Float32Array, primary: Float32Array, secondary: Float32Array, switchTime: number, sampleRate: number): void {
    const switchSamples = switchTime * sampleRate;
    let usePrimary = true;

    for (let i = 0; i < output.length; i++) {
      if (i % switchSamples === 0) {
        usePrimary = !usePrimary;
      }

      const primarySample = i < primary.length ? primary[i] : 0;
      const secondarySample = i < secondary.length ? secondary[i] : 0;

      output[i] = usePrimary ? primarySample : secondarySample;
    }
  }

  private layerAudio(output: Float32Array, primary: Float32Array, secondary: Float32Array, secondaryGain: number): void {
    for (let i = 0; i < output.length; i++) {
      const primarySample = i < primary.length ? primary[i] : 0;
      const secondarySample = i < secondary.length ? secondary[i] * secondaryGain : 0;
      output[i] = Math.tanh(primarySample + secondarySample); // Soft clipping
    }
  }

  private async createMorphedAudio(fromUrl: string, toUrl: string, morphDuration: number): Promise<string> {
    // Simplified implementation - would need more sophisticated morphing in production
    return await this.mixAudioSources(fromUrl, toUrl, {
      primaryVoiceId: 'from',
      secondaryVoiceId: 'to',
      mixRatio: 50,
      crossfadeTime: morphDuration,
      mode: 'morph'
    });
  }

  private async concatenateAudio(audioUrls: string[]): Promise<string> {
    try {
      const audioBuffers: AudioBuffer[] = [];
      
      // Load all audio buffers
      for (const url of audioUrls) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        audioBuffers.push(audioBuffer);
      }

      if (audioBuffers.length === 0) {
        throw new Error('No audio buffers to concatenate');
      }

      // Calculate total length
      const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
      
      // Create concatenated buffer
      const concatenatedBuffer = this.audioContext.createBuffer(
        audioBuffers[0].numberOfChannels,
        totalLength,
        audioBuffers[0].sampleRate
      );

      // Copy data
      let offset = 0;
      for (const buffer of audioBuffers) {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          concatenatedBuffer.getChannelData(channel).set(channelData, offset);
        }
        offset += buffer.length;
      }

      return await this.audioBufferToBlobUrl(concatenatedBuffer, 'mp3');
    } catch (error) {
      console.error('Audio concatenation failed:', error);
      throw new Error('Audio concatenation failed');
    }
  }

  private async audioBufferToBlobUrl(buffer: AudioBuffer, format: string): Promise<string> {
    // This is a simplified implementation
    // In production, you'd use a proper audio encoder
    const arrayBuffer = this.audioBufferToArrayBuffer(buffer);
    const blob = new Blob([arrayBuffer], { type: `audio/${format}` });
    return URL.createObjectURL(blob);
  }

  private audioBufferToArrayBuffer(buffer: AudioBuffer): ArrayBuffer {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2; // 16-bit
    const arrayBuffer = new ArrayBuffer(length);
    const view = new Int16Array(arrayBuffer);
    let offset = 0;

    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view[offset++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
    }

    return arrayBuffer;
  }
}

// Effect Processors
abstract class AudioEffectProcessor {
  abstract createNode(audioContext: AudioContext, effect: AudioEffect): AudioNode;
  abstract processAudio(buffer: AudioBuffer, effect: AudioEffect, audioContext: AudioContext): Promise<AudioBuffer>;
}

class ReverbProcessor extends AudioEffectProcessor {
  createNode(audioContext: AudioContext, effect: AudioEffect): AudioNode {
    const convolver = audioContext.createConvolver();
    // Create impulse response for reverb
    const impulseLength = audioContext.sampleRate * (effect.parameters.roomSize || 2);
    const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        const decay = Math.pow(1 - (i / impulseLength), effect.parameters.decay || 2);
        channelData[i] = (Math.random() * 2 - 1) * decay * (effect.intensity / 100);
      }
    }
    
    convolver.buffer = impulse;
    return convolver;
  }

  async processAudio(buffer: AudioBuffer, effect: AudioEffect, audioContext: AudioContext): Promise<AudioBuffer> {
    // Simplified reverb processing
    return buffer; // Would implement actual reverb processing here
  }
}

class EchoProcessor extends AudioEffectProcessor {
  createNode(audioContext: AudioContext, effect: AudioEffect): AudioNode {
    const delay = audioContext.createDelay(effect.parameters.maxDelay || 1);
    const feedback = audioContext.createGain();
    const wetGain = audioContext.createGain();
    
    delay.delayTime.value = effect.parameters.delayTime || 0.3;
    feedback.gain.value = (effect.parameters.feedback || 30) / 100;
    wetGain.gain.value = effect.intensity / 100;
    
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wetGain);
    
    return delay;
  }

  async processAudio(buffer: AudioBuffer, effect: AudioEffect, audioContext: AudioContext): Promise<AudioBuffer> {
    return buffer; // Would implement actual echo processing here
  }
}

class ChorusProcessor extends AudioEffectProcessor {
  createNode(audioContext: AudioContext, effect: AudioEffect): AudioNode {
    // Simplified chorus using multiple delays with LFO modulation
    const delay = audioContext.createDelay(0.05);
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    lfo.frequency.value = effect.parameters.rate || 1;
    lfoGain.gain.value = (effect.parameters.depth || 50) / 1000;
    
    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);
    lfo.start();
    
    return delay;
  }

  async processAudio(buffer: AudioBuffer, effect: AudioEffect, audioContext: AudioContext): Promise<AudioBuffer> {
    return buffer;
  }
}

class DistortionProcessor extends AudioEffectProcessor {
  createNode(audioContext: AudioContext, effect: AudioEffect): AudioNode {
    const waveshaper = audioContext.createWaveShaper();
    const amount = effect.intensity;
    const samples = 44100;
    const curve = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * amount / 10);
    }
    
    waveshaper.curve = curve;
    return waveshaper;
  }

  async processAudio(buffer: AudioBuffer, effect: AudioEffect, audioContext: AudioContext): Promise<AudioBuffer> {
    return buffer;
  }
}

class PitchShiftProcessor extends AudioEffectProcessor {
  createNode(audioContext: AudioContext, effect: AudioEffect): AudioNode {
    // Simplified pitch shifting (would use more sophisticated algorithms in production)
    return audioContext.createGain(); // Placeholder
  }

  async processAudio(buffer: AudioBuffer, effect: AudioEffect, audioContext: AudioContext): Promise<AudioBuffer> {
    return buffer;
  }
}

class TimeStretchProcessor extends AudioEffectProcessor {
  createNode(audioContext: AudioContext, effect: AudioEffect): AudioNode {
    return audioContext.createGain(); // Placeholder
  }

  async processAudio(buffer: AudioBuffer, effect: AudioEffect, audioContext: AudioContext): Promise<AudioBuffer> {
    return buffer;
  }
}

class NoiseGateProcessor extends AudioEffectProcessor {
  createNode(audioContext: AudioContext, effect: AudioEffect): AudioNode {
    // Would implement noise gate using gain node with threshold detection
    return audioContext.createGain();
  }

  async processAudio(buffer: AudioBuffer, effect: AudioEffect, audioContext: AudioContext): Promise<AudioBuffer> {
    return buffer;
  }
}

class CompressorProcessor extends AudioEffectProcessor {
  createNode(audioContext: AudioContext, effect: AudioEffect): AudioNode {
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = effect.parameters.threshold || -24;
    compressor.knee.value = effect.parameters.knee || 30;
    compressor.ratio.value = effect.parameters.ratio || 12;
    compressor.attack.value = (effect.parameters.attack || 3) / 1000;
    compressor.release.value = (effect.parameters.release || 250) / 1000;
    return compressor;
  }

  async processAudio(buffer: AudioBuffer, effect: AudioEffect, audioContext: AudioContext): Promise<AudioBuffer> {
    return buffer;
  }
}

// Batch Processing
class BatchJob {
  private request: BatchGenerationRequest;
  private engine: AdvancedTTSEngine;
  private onProgress?: (result: BatchGenerationResult) => void;
  private result: BatchGenerationResult;
  private isCancelled = false;

  constructor(
    request: BatchGenerationRequest,
    engine: AdvancedTTSEngine,
    onProgress?: (result: BatchGenerationResult) => void
  ) {
    this.request = request;
    this.engine = engine;
    this.onProgress = onProgress;
    this.result = {
      id: request.id,
      totalItems: request.texts.length,
      completedItems: 0,
      progress: 0,
      outputs: [],
      errors: [],
      estimatedTimeRemaining: request.texts.length * 30, // 30 seconds per item estimate
      status: 'pending'
    };
  }

  async start(): Promise<void> {
    this.result.status = 'processing';
    this.updateProgress();

    try {
      for (let i = 0; i < this.request.texts.length; i++) {
        if (this.isCancelled) {
          this.result.status = 'cancelled';
          break;
        }

        try {
          const text = this.request.texts[i];
          const filename = this.generateFilename(i, text);
          
          const generation = await this.engine.generateAdvancedSpeech(
            text,
            this.request.voiceId,
            this.request.settings,
            {
              effects: this.request.effects,
              enableWatermarking: true
            }
          );

          // Update filename in generation
          generation.id = filename;
          this.result.outputs.push(generation);
          
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.result.errors.push(`Item ${i + 1}: ${message}`);
        }

        this.result.completedItems++;
        this.result.progress = Math.round((this.result.completedItems / this.result.totalItems) * 100);
        this.result.estimatedTimeRemaining = Math.max(0, (this.result.totalItems - this.result.completedItems) * 30);
        
        this.updateProgress();
      }

      if (!this.isCancelled) {
        // Handle output format
        if (this.request.outputFormat === 'concatenated' && this.result.outputs.length > 0) {
          await this.concatenateOutputs();
        } else if (this.request.outputFormat === 'playlist') {
          await this.createPlaylist();
        }

        this.result.status = 'completed';
      }
    } catch (error) {
      this.result.status = 'failed';
      const message = error instanceof Error ? error.message : String(error);
      this.result.errors.push(`Batch processing failed: ${message}`);
    } finally {
      this.updateProgress();
    }
  }

  cancel(): void {
    this.isCancelled = true;
  }

  getProgress(): BatchGenerationResult {
    return { ...this.result };
  }

  private updateProgress(): void {
    if (this.onProgress) {
      this.onProgress(this.getProgress());
    }
  }

  private generateFilename(index: number, text: string): string {
    let filename = this.request.naming.prefix;
    
    if (this.request.naming.includeIndex) {
      filename += `_${String(index + 1).padStart(3, '0')}`;
    }
    
    if (this.request.naming.includeTimestamp) {
      filename += `_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    }
    
    // Add text snippet if filename is too generic
    if (filename === this.request.naming.prefix) {
      const textSnippet = text.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
      filename += `_${textSnippet}`;
    }
    
    return filename;
  }

  private async concatenateOutputs(): Promise<void> {
    if (this.result.outputs.length === 0) return;

    try {
      const audioUrls = this.result.outputs.map(output => output.audioUrl);
      const concatenatedUrl = await (this.engine as any).concatenateAudio(audioUrls);
      
      // Replace individual outputs with single concatenated output
      this.result.outputs = [{
        ...this.result.outputs[0],
        id: `${this.request.naming.prefix}_concatenated`,
        text: this.request.texts.join(' '),
        audioUrl: concatenatedUrl,
        duration: this.result.outputs.reduce((sum, output) => sum + output.duration, 0)
      }];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.result.errors.push(`Concatenation failed: ${message}`);
    }
  }

  private async createPlaylist(): Promise<void> {
    // Create M3U playlist file
    const playlistContent = this.result.outputs
      .map(output => `#EXTINF:${Math.round(output.duration)},${output.text.substring(0, 50)}\n${output.audioUrl}`)
      .join('\n');
    
    const blob = new Blob([playlistContent], { type: 'audio/x-mpegurl' });
    const playlistUrl = URL.createObjectURL(blob);
    
    // Add playlist as additional output
    this.result.outputs.push({
      id: `${this.request.naming.prefix}_playlist.m3u`,
      voiceId: 'playlist',
      text: 'Audio Playlist',
      audioUrl: playlistUrl,
      duration: this.result.outputs.reduce((sum, output) => sum + output.duration, 0),
      createdAt: new Date(),
      settings: this.request.settings,
      licensing: this.result.outputs[0]?.licensing || {
        id: uuidv4(),
        type: 'personal',
        allowCommercialUse: false,
        allowModification: false,
        allowDistribution: false,
        attribution: false,
        usageCount: 1,
        watermarked: false
      },
      watermarked: false,
      usage: {
        userId: 'current-user',
        generationId: uuidv4(),
        downloadCount: 0,
        shareCount: 0,
        lastAccessed: new Date()
      }
    });
  }
}

// Export singleton instance
export const advancedTTSEngine = new AdvancedTTSEngine();