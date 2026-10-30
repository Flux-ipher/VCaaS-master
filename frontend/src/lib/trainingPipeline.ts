import { VoiceTrainingData, VoiceModel, TrainingSettings, AudioAnalytics } from '../types/voice';
import { voiceCloningEngine } from './voiceCloning';
import { v4 as uuidv4 } from 'uuid';

export interface TrainingProgress {
  voiceId: string;
  phase: 'preprocessing' | 'training' | 'validation' | 'optimization' | 'completion';
  progress: number; // 0-100
  currentEpoch?: number;
  totalEpochs?: number;
  loss?: number;
  accuracy?: number;
  estimatedTimeRemaining?: number; // in minutes
  message: string;
  analytics?: AudioAnalytics;
}

export interface TrainingMetrics {
  voiceId: string;
  epoch: number;
  trainingLoss: number;
  validationLoss: number;
  accuracy: number;
  similarity: number;
  quality: number;
  timestamp: Date;
}

export interface QualityAssessment {
  overall: number; // 0-100
  clarity: number;
  naturalness: number;
  similarity: number;
  consistency: number;
  details: {
    issues: string[];
    recommendations: string[];
    strengths: string[];
  };
}

export class VoiceTrainingPipeline {
  private trainingJobs = new Map<string, TrainingJob>();
  private progressCallbacks = new Map<string, (progress: TrainingProgress) => void>();

  /**
   * Start training a voice model
   */
  async startTraining(
    data: VoiceTrainingData,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<string> {
    const voiceId = data.voiceId;
    
    if (this.trainingJobs.has(voiceId)) {
      throw new Error('Training job already in progress for this voice');
    }

    // Register progress callback
    if (onProgress) {
      this.progressCallbacks.set(voiceId, onProgress);
    }

    // Create and start training job
    const job = new TrainingJob(voiceId, data, this.onTrainingProgress.bind(this));
    this.trainingJobs.set(voiceId, job);
    
    // Start training asynchronously
    job.start().catch((error) => {
      console.error(`Training failed for voice ${voiceId}:`, error);
      const message = error instanceof Error ? error.message : String(error);
      this.onTrainingComplete(voiceId, false, message);
    });

    return voiceId;
  }

  /**
   * Stop training for a voice
   */
  async stopTraining(voiceId: string): Promise<boolean> {
    const job = this.trainingJobs.get(voiceId);
    if (!job) {
      return false;
    }

    job.stop();
    this.trainingJobs.delete(voiceId);
    this.progressCallbacks.delete(voiceId);
    
    return true;
  }

  /**
   * Get current training progress
   */
  getTrainingProgress(voiceId: string): TrainingProgress | null {
    const job = this.trainingJobs.get(voiceId);
    return job?.getCurrentProgress() || null;
  }

  /**
   * Get all active training jobs
   */
  getActiveTrainingJobs(): string[] {
    return Array.from(this.trainingJobs.keys());
  }

  /**
   * Assess voice quality
   */
  async assessVoiceQuality(voiceId: string, sampleAudio?: ArrayBuffer): Promise<QualityAssessment> {
    try {
      let analytics: AudioAnalytics;

      if (sampleAudio) {
        const file = new File([sampleAudio], 'sample.wav', { type: 'audio/wav' });
        analytics = await voiceCloningEngine.analyzeVoice(file);
      } else {
        // Generate a sample for analysis
        const sampleText = "The quick brown fox jumps over the lazy dog. This is a comprehensive test of voice quality and naturalness.";
        const audioGeneration = await voiceCloningEngine.generateSpeech({
          text: sampleText,
          voiceId: voiceId,
          settings: {
            speed: 1.0,
            pitch: 0,
            volume: 1.0,
            format: 'wav',
            sampleRate: 44100
          },
          licensing: false
        });

        // Convert audio URL to ArrayBuffer for analysis
        const response = await fetch(audioGeneration.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const file = new File([arrayBuffer], 'generated-sample.wav', { type: 'audio/wav' });
        analytics = await voiceCloningEngine.analyzeVoice(file);
      }

      return this.calculateQualityAssessment(analytics);
    } catch (error) {
      console.error('Quality assessment failed:', error);
      throw new Error('Failed to assess voice quality');
    }
  }

  /**
   * Optimize voice model
   */
  async optimizeVoice(
    voiceId: string,
    targetQuality: number = 90,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<VoiceModel> {
    // Register progress callback
    if (onProgress) {
      this.progressCallbacks.set(`${voiceId}-optimize`, onProgress);
    }

    try {
      // Assess current quality
      const initialAssessment = await this.assessVoiceQuality(voiceId);
      
      if (initialAssessment.overall >= targetQuality) {
        throw new Error(`Voice already meets target quality (${initialAssessment.overall}% >= ${targetQuality}%)`);
      }

      // Start optimization process
      const optimizationSteps = this.generateOptimizationSteps(initialAssessment, targetQuality);
      let currentProgress = 0;
      const totalSteps = optimizationSteps.length;

      for (let i = 0; i < optimizationSteps.length; i++) {
        const step = optimizationSteps[i];
        currentProgress = Math.round(((i + 1) / totalSteps) * 100);

        // Update progress
        this.reportProgress(`${voiceId}-optimize`, {
          voiceId,
          phase: 'optimization',
          progress: currentProgress,
          message: step.description,
          estimatedTimeRemaining: step.estimatedTime
        });

        // Simulate optimization step
        await this.executeOptimizationStep(voiceId, step);
        
        // Small delay for realistic progress updates
        await new Promise(resolve => setTimeout(resolve, step.duration));
      }

      // Final quality assessment
      const finalAssessment = await this.assessVoiceQuality(voiceId);
      
      // Create optimized voice model
      const optimizedModel: VoiceModel = {
        id: voiceId,
        name: `Optimized Voice ${voiceId.slice(0, 8)}`,
        userId: 'current-user',
        status: 'ready',
        trainingProgress: 100,
        language: 'en-US',
        gender: 'neutral',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          trainingDuration: optimizationSteps.reduce((sum, step) => sum + step.duration, 0) / 60000,
          sampleCount: 0,
          quality: finalAssessment.overall,
          similarity: finalAssessment.similarity
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

      // Cleanup
      this.progressCallbacks.delete(`${voiceId}-optimize`);
      
      return optimizedModel;
    } catch (error) {
      this.progressCallbacks.delete(`${voiceId}-optimize`);
      throw error;
    }
  }

  // Private methods

  private onTrainingProgress(voiceId: string, progress: TrainingProgress): void {
    const callback = this.progressCallbacks.get(voiceId);
    if (callback) {
      callback(progress);
    }
  }

  private onTrainingComplete(voiceId: string, success: boolean, error?: string): void {
    const job = this.trainingJobs.get(voiceId);
    if (job) {
      this.trainingJobs.delete(voiceId);
      
      // Final progress update
      const callback = this.progressCallbacks.get(voiceId);
      if (callback) {
        callback({
          voiceId,
          phase: 'completion',
          progress: success ? 100 : 0,
          message: success ? 'Training completed successfully!' : `Training failed: ${error}`
        });
        
        this.progressCallbacks.delete(voiceId);
      }
    }
  }

  private calculateQualityAssessment(analytics: AudioAnalytics): QualityAssessment {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const strengths: string[] = [];

    // Analyze clarity
    if (analytics.clarity < 70) {
      issues.push('Low audio clarity detected');
      recommendations.push('Consider using higher quality training audio');
    } else if (analytics.clarity > 85) {
      strengths.push('Excellent audio clarity');
    }

    // Analyze naturalness
    if (analytics.naturalness < 65) {
      issues.push('Voice sounds robotic or unnatural');
      recommendations.push('Increase training data diversity or adjust model parameters');
    } else if (analytics.naturalness > 80) {
      strengths.push('Highly natural sounding voice');
    }

    // Analyze similarity
    if (analytics.similarity < 75) {
      issues.push('Low similarity to original voice');
      recommendations.push('Provide more varied training samples of the target voice');
    } else if (analytics.similarity > 90) {
      strengths.push('Excellent voice similarity');
    }

    // Calculate consistency based on pitch variance
    const consistency = Math.max(0, 100 - analytics.pitch.variance * 5);
    if (consistency < 70) {
      issues.push('Inconsistent voice characteristics');
      recommendations.push('Use more consistent training data or enable data augmentation');
    } else if (consistency > 85) {
      strengths.push('Highly consistent voice characteristics');
    }

    // Calculate overall score
    const overall = Math.round(
      (analytics.clarity * 0.25 + 
       analytics.naturalness * 0.3 + 
       analytics.similarity * 0.25 + 
       consistency * 0.2)
    );

    return {
      overall,
      clarity: Math.round(analytics.clarity),
      naturalness: Math.round(analytics.naturalness),
      similarity: Math.round(analytics.similarity),
      consistency: Math.round(consistency),
      details: {
        issues,
        recommendations,
        strengths
      }
    };
  }

  private generateOptimizationSteps(assessment: QualityAssessment, targetQuality: number): OptimizationStep[] {
    const steps: OptimizationStep[] = [];
    const qualityGap = targetQuality - assessment.overall;

    // Add steps based on identified issues
    if (assessment.clarity < targetQuality) {
      steps.push({
        type: 'audio_enhancement',
        description: 'Enhancing audio clarity',
        estimatedTime: 2,
        duration: 2000,
        expectedImprovement: Math.min(15, qualityGap * 0.3)
      });
    }

    if (assessment.naturalness < targetQuality) {
      steps.push({
        type: 'prosody_adjustment',
        description: 'Adjusting prosody and intonation',
        estimatedTime: 3,
        duration: 3000,
        expectedImprovement: Math.min(12, qualityGap * 0.25)
      });
    }

    if (assessment.similarity < targetQuality) {
      steps.push({
        type: 'similarity_enhancement',
        description: 'Enhancing voice similarity',
        estimatedTime: 4,
        duration: 4000,
        expectedImprovement: Math.min(18, qualityGap * 0.35)
      });
    }

    if (assessment.consistency < targetQuality) {
      steps.push({
        type: 'consistency_optimization',
        description: 'Optimizing voice consistency',
        estimatedTime: 2,
        duration: 2500,
        expectedImprovement: Math.min(10, qualityGap * 0.2)
      });
    }

    // Always add final polishing step
    steps.push({
      type: 'final_polish',
      description: 'Applying final optimizations',
      estimatedTime: 1,
      duration: 1500,
      expectedImprovement: Math.min(5, qualityGap * 0.1)
    });

    return steps;
  }

  private async executeOptimizationStep(voiceId: string, step: OptimizationStep): Promise<void> {
    // Simulate optimization step execution
    // In a real implementation, this would apply specific optimizations based on the step type
    switch (step.type) {
      case 'audio_enhancement':
        // Apply noise reduction, normalization, etc.
        break;
      case 'prosody_adjustment':
        // Adjust timing, stress patterns, etc.
        break;
      case 'similarity_enhancement':
        // Fine-tune model parameters for better similarity
        break;
      case 'consistency_optimization':
        // Optimize for consistent voice characteristics
        break;
      case 'final_polish':
        // Apply final optimizations and cleanup
        break;
    }
  }

  private reportProgress(jobId: string, progress: TrainingProgress): void {
    const callback = this.progressCallbacks.get(jobId);
    if (callback) {
      callback(progress);
    }
  }
}

interface OptimizationStep {
  type: 'audio_enhancement' | 'prosody_adjustment' | 'similarity_enhancement' | 'consistency_optimization' | 'final_polish';
  description: string;
  estimatedTime: number; // in minutes
  duration: number; // in milliseconds for simulation
  expectedImprovement: number; // quality points
}

/**
 * Training job class to handle individual voice training
 */
class TrainingJob {
  private voiceId: string;
  private data: VoiceTrainingData;
  private onProgress: (voiceId: string, progress: TrainingProgress) => void;
  private currentProgress: TrainingProgress;
  private isRunning = false;
  private shouldStop = false;

  constructor(
    voiceId: string,
    data: VoiceTrainingData,
    onProgress: (voiceId: string, progress: TrainingProgress) => void
  ) {
    this.voiceId = voiceId;
    this.data = data;
    this.onProgress = onProgress;
    this.currentProgress = {
      voiceId,
      phase: 'preprocessing',
      progress: 0,
      message: 'Initializing training...'
    };
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.shouldStop = false;

    try {
      // Phase 1: Preprocessing
      await this.runPreprocessing();
      if (this.shouldStop) return;

      // Phase 2: Training
      await this.runTraining();
      if (this.shouldStop) return;

      // Phase 3: Validation
      await this.runValidation();
      if (this.shouldStop) return;

      // Phase 4: Optimization
      await this.runOptimization();
      if (this.shouldStop) return;

      // Phase 5: Completion
      this.updateProgress('completion', 100, 'Training completed successfully!');
      
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.updateProgress('completion', 0, `Training failed: ${message}`);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  stop(): void {
    this.shouldStop = true;
  }

  getCurrentProgress(): TrainingProgress {
    return { ...this.currentProgress };
  }

  private async runPreprocessing(): Promise<void> {
    this.updateProgress('preprocessing', 0, 'Preprocessing audio files...');
    
    const steps = [
      'Validating audio files',
      'Noise reduction',
      'Normalization',
      'Segmentation',
      'Feature extraction'
    ];

    for (let i = 0; i < steps.length; i++) {
      if (this.shouldStop) return;
      
      this.updateProgress('preprocessing', (i / steps.length) * 100, steps[i]);
      await this.delay(1000);
    }
  }

  private async runTraining(): Promise<void> {
    const totalEpochs = this.data.settings.epochs;
    this.updateProgress('training', 0, 'Starting model training...', 1, totalEpochs);

    for (let epoch = 1; epoch <= totalEpochs; epoch++) {
      if (this.shouldStop) return;

      // Simulate training metrics
      const loss = Math.max(0.1, 2.0 - (epoch / totalEpochs) * 1.8 + Math.random() * 0.2);
      const accuracy = Math.min(95, 60 + (epoch / totalEpochs) * 30 + Math.random() * 5);
      
      const progress = (epoch / totalEpochs) * 100;
      const timeRemaining = Math.max(0, (totalEpochs - epoch) * 2); // 2 minutes per epoch
      
      this.updateProgress(
        'training',
        progress,
        `Training epoch ${epoch}/${totalEpochs}`,
        epoch,
        totalEpochs,
        loss,
        accuracy,
        timeRemaining
      );

      await this.delay(2000); // Simulate training time
    }
  }

  private async runValidation(): Promise<void> {
    this.updateProgress('validation', 0, 'Validating model performance...');
    
    const validationSteps = [
      'Testing voice similarity',
      'Analyzing audio quality',
      'Checking consistency',
      'Performance evaluation'
    ];

    for (let i = 0; i < validationSteps.length; i++) {
      if (this.shouldStop) return;
      
      this.updateProgress('validation', (i / validationSteps.length) * 100, validationSteps[i]);
      await this.delay(1500);
    }
  }

  private async runOptimization(): Promise<void> {
    this.updateProgress('optimization', 0, 'Optimizing model parameters...');
    
    const optimizationSteps = [
      'Fine-tuning parameters',
      'Applying post-processing',
      'Quality enhancement',
      'Final validation'
    ];

    for (let i = 0; i < optimizationSteps.length; i++) {
      if (this.shouldStop) return;
      
      this.updateProgress('optimization', (i / optimizationSteps.length) * 100, optimizationSteps[i]);
      await this.delay(1200);
    }
  }

  private updateProgress(
    phase: TrainingProgress['phase'],
    progress: number,
    message: string,
    currentEpoch?: number,
    totalEpochs?: number,
    loss?: number,
    accuracy?: number,
    estimatedTimeRemaining?: number
  ): void {
    this.currentProgress = {
      voiceId: this.voiceId,
      phase,
      progress: Math.round(progress),
      currentEpoch,
      totalEpochs,
      loss,
      accuracy,
      estimatedTimeRemaining,
      message
    };

    this.onProgress(this.voiceId, this.currentProgress);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const voiceTrainingPipeline = new VoiceTrainingPipeline();