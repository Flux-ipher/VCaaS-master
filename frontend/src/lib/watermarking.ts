import * as crypto from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { WatermarkOptions } from '../types/voice';

export class AudioWatermarking {
  private audioContext: AudioContext | null = null;
  private sampleRate: number = 44100;

  constructor() {
    // Only initialize AudioContext in browser environment
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioContext) {
      if (typeof window === 'undefined') {
        throw new Error('AudioContext not available in server environment');
      }
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Embeds invisible watermark into audio using spectral spreading
   */
  async embedWatermark(
    audioBuffer: ArrayBuffer, 
    watermarkData: string, 
    options: WatermarkOptions = {
      type: 'invisible',
      strength: 30,
      payload: '',
      method: 'spectral'
    }
  ): Promise<ArrayBuffer> {
    const audioContext = this.ensureAudioContext();
    const decodedAudio = await audioContext.decodeAudioData(audioBuffer.slice(0));
    
    // Generate watermark payload with metadata
    const payload = this.generateWatermarkPayload(watermarkData, options.payload);
    
    let watermarkedBuffer: AudioBuffer;
    
    switch (options.method) {
      case 'spectral':
        watermarkedBuffer = await this.embedSpectralWatermark(decodedAudio, payload, options.strength);
        break;
      case 'temporal':
        watermarkedBuffer = await this.embedTemporalWatermark(decodedAudio, payload, options.strength);
        break;
      case 'echo':
        watermarkedBuffer = await this.embedEchoWatermark(decodedAudio, payload, options.strength);
        break;
      case 'lsb':
        watermarkedBuffer = await this.embedLSBWatermark(decodedAudio, payload, options.strength);
        break;
      default:
        watermarkedBuffer = await this.embedSpectralWatermark(decodedAudio, payload, options.strength);
    }

    return this.audioBufferToArrayBuffer(watermarkedBuffer);
  }

  /**
   * Extracts watermark from audio
   */
  async extractWatermark(audioBuffer: ArrayBuffer, method: 'spectral' | 'temporal' | 'echo' | 'lsb' = 'spectral'): Promise<string | null> {
    const audioContext = this.ensureAudioContext();
    const decodedAudio = await audioContext.decodeAudioData(audioBuffer.slice(0));
    
    switch (method) {
      case 'spectral':
        return this.extractSpectralWatermark(decodedAudio);
      case 'temporal':
        return this.extractTemporalWatermark(decodedAudio);
      case 'echo':
        return this.extractEchoWatermark(decodedAudio);
      case 'lsb':
        return this.extractLSBWatermark(decodedAudio);
      default:
        return this.extractSpectralWatermark(decodedAudio);
    }
  }

  /**
   * Spectral watermarking using frequency domain manipulation
   */
  private async embedSpectralWatermark(audioBuffer: AudioBuffer, payload: string, strength: number): Promise<AudioBuffer> {
    const channelData = audioBuffer.getChannelData(0);
    const fftSize = 2048;
    const overlap = fftSize / 2;
    const watermarkedData = new Float32Array(channelData.length);
    watermarkedData.set(channelData);

    // Convert payload to binary
    const binaryPayload = this.stringToBinary(payload);
    let bitIndex = 0;

    for (let i = 0; i < channelData.length - fftSize; i += overlap) {
      if (bitIndex >= binaryPayload.length) break;

      const frame = channelData.slice(i, i + fftSize);
      const spectrum = this.fft(frame);
      
      // Embed watermark bits in specific frequency bins
      const freqBins = this.getWatermarkFrequencyBins(fftSize);
      
      for (const bin of freqBins) {
        if (bitIndex >= binaryPayload.length) break;
        
        const bit = parseInt(binaryPayload[bitIndex]);
        const strengthFactor = strength / 100;
        
        // Modify magnitude based on bit value
        if (bit === 1) {
          spectrum.real[bin] *= (1 + strengthFactor * 0.01);
          spectrum.imag[bin] *= (1 + strengthFactor * 0.01);
        } else {
          spectrum.real[bin] *= (1 - strengthFactor * 0.01);
          spectrum.imag[bin] *= (1 - strengthFactor * 0.01);
        }
        
        bitIndex++;
      }

      const watermarkedFrame = this.ifft(spectrum);
      watermarkedData.set(watermarkedFrame, i);
    }

      const ctx = this.ensureAudioContext();
      const watermarkedBuffer = ctx.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
    
    watermarkedBuffer.getChannelData(0).set(watermarkedData);
    
    return watermarkedBuffer;
  }

  /**
   * Extract spectral watermark
   */
  private extractSpectralWatermark(audioBuffer: AudioBuffer): string | null {
    const channelData = audioBuffer.getChannelData(0);
    const fftSize = 2048;
    const overlap = fftSize / 2;
    let extractedBits = '';

    for (let i = 0; i < channelData.length - fftSize; i += overlap) {
      const frame = channelData.slice(i, i + fftSize);
      const spectrum = this.fft(frame);
      const freqBins = this.getWatermarkFrequencyBins(fftSize);
      
      for (const bin of freqBins) {
        const magnitude = Math.sqrt(spectrum.real[bin] ** 2 + spectrum.imag[bin] ** 2);
        const threshold = this.calculateThreshold(spectrum, bin);
        
        extractedBits += magnitude > threshold ? '1' : '0';
      }
    }

    try {
      const extractedPayload = this.binaryToString(extractedBits);
      return this.parseWatermarkPayload(extractedPayload);
    } catch (error) {
      return null;
    }
  }

  /**
   * Temporal watermarking using time-domain manipulation
   */
  private async embedTemporalWatermark(audioBuffer: AudioBuffer, payload: string, strength: number): Promise<AudioBuffer> {
    const channelData = audioBuffer.getChannelData(0);
    const watermarkedData = new Float32Array(channelData.length);
    watermarkedData.set(channelData);

    const binaryPayload = this.stringToBinary(payload);
    const samplesPerBit = Math.floor(channelData.length / binaryPayload.length);
    const strengthFactor = strength / 1000; // Much smaller for temporal

    for (let i = 0; i < binaryPayload.length; i++) {
      const bit = parseInt(binaryPayload[i]);
      const startSample = i * samplesPerBit;
      const endSample = Math.min((i + 1) * samplesPerBit, channelData.length);

      for (let j = startSample; j < endSample; j++) {
        if (bit === 1) {
          watermarkedData[j] *= (1 + strengthFactor);
        } else {
          watermarkedData[j] *= (1 - strengthFactor);
        }
      }
    }

    const ctx = this.ensureAudioContext();
    const watermarkedBuffer = ctx.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    watermarkedBuffer.getChannelData(0).set(watermarkedData);
    
    return watermarkedBuffer;
  }

  /**
   * Extract temporal watermark
   */
  private extractTemporalWatermark(audioBuffer: AudioBuffer): string | null {
    // Implementation for temporal watermark extraction
    // This would analyze amplitude variations over time
    return null; // Simplified for demo
  }

  /**
   * Echo watermarking using delayed copies
   */
  private async embedEchoWatermark(audioBuffer: AudioBuffer, payload: string, strength: number): Promise<AudioBuffer> {
    const channelData = audioBuffer.getChannelData(0);
    const watermarkedData = new Float32Array(channelData.length);
    watermarkedData.set(channelData);

    const binaryPayload = this.stringToBinary(payload);
    const echoDelay = Math.floor(this.sampleRate * 0.001); // 1ms delay
    const strengthFactor = strength / 100;

    for (let i = 0; i < binaryPayload.length && i < channelData.length - echoDelay; i++) {
      const bit = parseInt(binaryPayload[i]);
      const bitPosition = Math.floor((i / binaryPayload.length) * (channelData.length - echoDelay));
      
      if (bit === 1) {
        for (let j = 0; j < echoDelay; j++) {
          if (bitPosition + j < watermarkedData.length) {
            watermarkedData[bitPosition + echoDelay + j] += 
              watermarkedData[bitPosition + j] * strengthFactor * 0.1;
          }
        }
      }
    }

    const ctx = this.ensureAudioContext();
    const watermarkedBuffer = ctx.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    watermarkedBuffer.getChannelData(0).set(watermarkedData);
    
    return watermarkedBuffer;
  }

  /**
   * Extract echo watermark
   */
  private extractEchoWatermark(audioBuffer: AudioBuffer): string | null {
    // Implementation for echo watermark extraction
    return null; // Simplified for demo
  }

  /**
   * LSB watermarking using least significant bits
   */
  private async embedLSBWatermark(audioBuffer: AudioBuffer, payload: string, strength: number): Promise<AudioBuffer> {
    const channelData = audioBuffer.getChannelData(0);
    const watermarkedData = new Float32Array(channelData.length);
    
    // Convert float32 to int16 for LSB manipulation
    const int16Data = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      int16Data[i] = Math.round(channelData[i] * 32767);
    }

    const binaryPayload = this.stringToBinary(payload);
    const samplesPerBit = Math.floor(channelData.length / binaryPayload.length);

    for (let i = 0; i < binaryPayload.length; i++) {
      const bit = parseInt(binaryPayload[i]);
      const sampleIndex = i * samplesPerBit;
      
      if (sampleIndex < int16Data.length) {
        // Modify LSB
        int16Data[sampleIndex] = (int16Data[sampleIndex] & 0xFFFE) | bit;
      }
    }

    // Convert back to float32
    for (let i = 0; i < channelData.length; i++) {
      watermarkedData[i] = int16Data[i] / 32767;
    }

    const ctx = this.ensureAudioContext();
    const watermarkedBuffer = ctx.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    watermarkedBuffer.getChannelData(0).set(watermarkedData);
    
    return watermarkedBuffer;
  }

  /**
   * Extract LSB watermark
   */
  private extractLSBWatermark(audioBuffer: AudioBuffer): string | null {
    const channelData = audioBuffer.getChannelData(0);
    const int16Data = new Int16Array(channelData.length);
    
    for (let i = 0; i < channelData.length; i++) {
      int16Data[i] = Math.round(channelData[i] * 32767);
    }

    let extractedBits = '';
    const expectedLength = 256; // Expected payload length in bits
    const samplesPerBit = Math.floor(channelData.length / expectedLength);

    for (let i = 0; i < expectedLength; i++) {
      const sampleIndex = i * samplesPerBit;
      if (sampleIndex < int16Data.length) {
        extractedBits += (int16Data[sampleIndex] & 1).toString();
      }
    }

    try {
      const extractedPayload = this.binaryToString(extractedBits);
      return this.parseWatermarkPayload(extractedPayload);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate watermark payload with metadata
   */
  private generateWatermarkPayload(data: string, additionalData: string = ''): string {
    const metadata = {
      id: uuidv4(),
      timestamp: Date.now(),
      data: data,
      additional: additionalData,
      checksum: this.calculateChecksum(data + additionalData)
    };
    
    return JSON.stringify(metadata);
  }

  /**
   * Parse watermark payload
   */
  private parseWatermarkPayload(payload: string): string | null {
    try {
      const metadata = JSON.parse(payload);
      const expectedChecksum = this.calculateChecksum(metadata.data + metadata.additional);
      
      if (metadata.checksum === expectedChecksum) {
        return metadata.data;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Utility functions
   */
  private stringToBinary(str: string): string {
    return str
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');
  }

  private binaryToString(binary: string): string {
    const chunks = binary.match(/.{8}/g) || [];
    return chunks
      .map(chunk => String.fromCharCode(parseInt(chunk, 2)))
      .join('');
  }

  private calculateChecksum(data: string): string {
    return crypto.MD5(data).toString();
  }

  private getWatermarkFrequencyBins(fftSize: number): number[] {
    // Use specific frequency bins for watermarking (avoid low frequencies)
    const bins: number[] = [];
    const startBin = Math.floor(fftSize * 0.1); // Skip lowest 10%
    const endBin = Math.floor(fftSize * 0.4);   // Use up to 40%
    const step = Math.floor((endBin - startBin) / 32); // 32 frequency bins
    
    for (let i = startBin; i < endBin; i += step) {
      bins.push(i);
    }
    
    return bins;
  }

  private calculateThreshold(spectrum: {real: Float32Array, imag: Float32Array}, bin: number): number {
    let sum = 0;
    let count = 0;
    const range = 10;
    
    for (let i = Math.max(0, bin - range); i < Math.min(spectrum.real.length, bin + range); i++) {
      sum += Math.sqrt(spectrum.real[i] ** 2 + spectrum.imag[i] ** 2);
      count++;
    }
    
    return count > 0 ? sum / count : 0;
  }

  private fft(signal: Float32Array): {real: Float32Array, imag: Float32Array} {
    // Simplified FFT implementation (in production, use a proper FFT library)
    const N = signal.length;
    const real = new Float32Array(N);
    const imag = new Float32Array(N);
    
    for (let k = 0; k < N; k++) {
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real[k] += signal[n] * Math.cos(angle);
        imag[k] += signal[n] * Math.sin(angle);
      }
    }
    
    return { real, imag };
  }

  private ifft(spectrum: {real: Float32Array, imag: Float32Array}): Float32Array {
    // Simplified IFFT implementation
    const N = spectrum.real.length;
    const signal = new Float32Array(N);
    
    for (let n = 0; n < N; n++) {
      for (let k = 0; k < N; k++) {
        const angle = 2 * Math.PI * k * n / N;
        signal[n] += spectrum.real[k] * Math.cos(angle) - spectrum.imag[k] * Math.sin(angle);
      }
      signal[n] /= N;
    }
    
    return signal;
  }

  private audioBufferToArrayBuffer(audioBuffer: AudioBuffer): ArrayBuffer {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2; // 16-bit
    const buffer = new ArrayBuffer(length);
    const view = new Int16Array(buffer);
    let offset = 0;

    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view[offset++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
    }

    return buffer;
  }
}