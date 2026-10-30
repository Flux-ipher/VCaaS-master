/**
 * PCMProcessor — AudioWorklet that converts Float32 mic samples to Int16 PCM
 * and streams them over a MessagePort to the main thread.
 *
 * Must be served as a standalone file (not bundled) because AudioWorklet
 * modules are loaded by the browser's audio thread, not the JS main thread.
 */
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.inputRate = sampleRate;
    this.outputRate = 16000;
    this.pending = [];
    this.outputPending = [];
    this.sourcePosition = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0]; // Float32Array, range -1.0 to 1.0

      // Browsers may ignore the requested AudioContext rate. Resample here so
      // the backend always receives mono PCM at exactly 16 kHz.
      for (let i = 0; i < channelData.length; i++) {
        this.pending.push(channelData[i]);
      }

      const ratio = this.inputRate / this.outputRate;
      const output = this.outputPending;
      while (this.sourcePosition + 1 < this.pending.length) {
        const leftIndex = Math.floor(this.sourcePosition);
        const fraction = this.sourcePosition - leftIndex;
        const left = this.pending[leftIndex];
        const right = this.pending[leftIndex + 1];
        output.push(left + (right - left) * fraction);
        this.sourcePosition += ratio;
      }

      // Keep the final interpolation sample for the next callback.
      const consumed = Math.min(
        Math.floor(this.sourcePosition),
        Math.max(0, this.pending.length - 1),
      );
      if (consumed > 0) {
        this.pending.splice(0, consumed);
        this.sourcePosition -= consumed;
      }

      // Send stable 30 ms frames (480 samples) to match the VAD cadence.
      while (output.length >= 480) {
        const pcm16 = new Int16Array(480);
        for (let i = 0; i < pcm16.length; i++) {
          const s = Math.max(-1, Math.min(1, output[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        output.splice(0, 480);
        this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
      }
      this.outputPending = output;
    }
    return true; // keep processor alive
  }
}

registerProcessor('pcm-processor', PCMProcessor);
