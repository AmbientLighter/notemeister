class PitchProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 2048;
        this.buffer = new Float32Array(this.bufferSize);
        this.pos = 0;
        this.wasSilent = false;
        this.silenceFrames = 0;
    }

    process(inputs) {
        const input = inputs[0][0];
        if (!input) return true;

        // Simple volume check (RMS) to ignore silence/background noise
        let sum = 0;
        for (let i = 0; i < input.length; i++) {
            sum += input[i] * input[i];
        }
        const rms = Math.sqrt(sum / input.length);

        // Only process if volume is above threshold
        if (rms < 0.002) {
            this.silenceFrames++;
            // Only report silence if it persists for ~50ms (at 128 samples per frame)
            if (this.silenceFrames > 15) {
                this.pos = 0; // Reset buffer on sustained silence
                if (!this.wasSilent) {
                    this.port.postMessage('SILENCE');
                    this.wasSilent = true;
                }
            }
            return true;
        }

        this.silenceFrames = 0;
        this.wasSilent = false;

        for (let i = 0; i < input.length; i++) {
            this.buffer[this.pos++] = input[i];

            if (this.pos >= this.bufferSize) {
                // Send the full buffer to the Worker
                this.port.postMessage(this.buffer);
                this.pos = 0;
            }
        }
        return true;
    }
}

registerProcessor('pitch-processor', PitchProcessor);
