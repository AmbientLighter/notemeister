# Audio Sampling Strategy

This document explains the technical strategy used for the musical instrument sounds in NoteMeister.

## Overview

NoteMeister uses [Tone.js](https://tonejs.github.io/) and high-quality audio samples to provide a realistic practice experience. To balance **audio quality**, **performance**, and **bundle size**, we use a strategic sampling approach rather than sampling every single note.

## Sample Anchors

For each instrument (Piano, Guitar, Flute), we bundle a small set of "anchor" samples (typically **C4**, **G4/A4**, and **C5**).

### Why these specific notes?

1.  **Pitch Shifting (Interpolation)**: `Tone.Sampler` uses these anchors to "fill in the gaps." To play a **D4**, it takes the **C4** sample and pitch-shifts it up automatically.
2.  **Timbre Preservation**: Stretching a single sample over many octaves creates a "chipmunk" or "slow-mo" effect, making the instrument sound artificial. By providing anchors at the bottom, middle, and top of the primary practice range, we ensure no sample is stretched more than a few semitones, preserving the natural character (timbre) of the instrument.
3.  **Efficiency & PWA Support**:
    - **Bundle Size**: A full 88-key piano library would be dozens of megabytes. Our strategy uses ~500KB total for all instruments.
    - **Offline Functionality**: These few samples are precached by the Service Worker, allowing the app to work entirely offline without quality loss.

## Implementation Details

The `AudioEngine` initializes `Tone.Sampler` instances with these local assets:

- **Piano**: C4, G4, C5
- **Guitar**: C4, G4, C5 (Acoustic)
- **Flute**: C4, A4, C5

By using this "sweet spot" approach, NoteMeister remains lightweight and fast while sounding significantly better than basic synthesized oscillators.
