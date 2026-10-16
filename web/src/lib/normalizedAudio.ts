/**
 * Loudness-normalised playback for the Wikimedia recordings, whose levels
 * vary a lot from one speaker/recording to the next.
 *
 * The clip is decoded, its speech RMS is measured (ignoring near-silence),
 * and it is played through a gain that brings it to a common target level,
 * followed by a limiter so boosted peaks never clip.
 */

/** Target speech RMS (~ -20 dBFS). */
const TARGET_RMS = 0.1
/** Samples below this fraction of the clip's peak count as silence/noise. */
const GATE_RATIO = 0.1
const MIN_GAIN = 0.5
const MAX_GAIN = 12

interface PreparedClip {
  buffer: AudioBuffer
  gain: number
}

let context: AudioContext | null = null
const prepared = new Map<string, Promise<PreparedClip>>()

function getContext(): AudioContext {
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    context = new Ctor()
  }
  return context
}

export function measureGain(buffer: AudioBuffer): number {
  let peak = 0
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i++) {
      peak = Math.max(peak, Math.abs(data[i]!))
    }
  }
  if (peak < 1e-5) return 1 // digital silence: nothing to normalise

  // Relative gate so very quiet recordings are still measured as speech.
  const gate = peak * GATE_RATIO
  let sum = 0
  let count = 0
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i++) {
      const s = data[i]!
      if (Math.abs(s) > gate) {
        sum += s * s
        count++
      }
    }
  }
  if (count === 0) return 1
  const rms = Math.sqrt(sum / count)
  return Math.min(MAX_GAIN, Math.max(MIN_GAIN, TARGET_RMS / rms))
}

function prepare(url: string): Promise<PreparedClip> {
  let clip = prepared.get(url)
  if (!clip) {
    clip = (async () => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`audio request failed (${res.status})`)
      const bytes = await res.arrayBuffer()
      const buffer = await getContext().decodeAudioData(bytes)
      return { buffer, gain: measureGain(buffer) }
    })()
    prepared.set(url, clip)
    // Don't cache failures: allow a retry on the next click.
    clip.catch(() => prepared.delete(url))
  }
  return clip
}

/**
 * Plays `url` at normalised loudness. Resolves with a `stop` function once
 * playback has started; rejects if the clip can't be fetched or decoded
 * (callers should then fall back to something else).
 */
export async function playNormalized(
  url: string,
  onEnded: () => void,
): Promise<() => void> {
  const ctx = getContext()
  // Must be requested synchronously within the click handler.
  void ctx.resume()

  const { buffer, gain } = await prepare(url)

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const gainNode = ctx.createGain()
  gainNode.gain.value = gain

  const limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -3
  limiter.knee.value = 0
  limiter.ratio.value = 20
  limiter.attack.value = 0.002
  limiter.release.value = 0.1

  source.connect(gainNode).connect(limiter).connect(ctx.destination)

  let stopped = false
  source.onended = () => {
    source.disconnect()
    gainNode.disconnect()
    limiter.disconnect()
    if (!stopped) onEnded()
  }
  source.start()

  return () => {
    stopped = true
    try {
      source.stop()
    } catch {
      /* already stopped */
    }
  }
}
