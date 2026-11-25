#!/usr/bin/env node
/**
 * Optimiza los clips public/video/(office/)paseo-1..6.mp4 para scroll scrubbing
 * instantáneo: keyframe cada 2 cuadros (-g 2), sin B-frames (-bf 0), 1280px,
 * sin audio y +faststart.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, renameSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import ffmpegPath from 'ffmpeg-static'

const execFileAsync = promisify(execFile)
const bin = ffmpegPath || 'ffmpeg'
const root = process.cwd()

const dirs = [
  resolve(root, 'public/video/office'),
  resolve(root, 'public/video'),
]
const clipIds = ['paseo-1', 'paseo-2', 'paseo-3', 'paseo-4', 'paseo-5', 'paseo-6']

const tasks = []
for (const dir of dirs) {
  for (const id of clipIds) {
    const input = resolve(dir, `${id}.mp4`)
    if (existsSync(input)) tasks.push({ dir, id, input })
  }
}

await Promise.all(
  tasks.map(async ({ id, input }) => {
    const beforeMb = (statSync(input).size / 1024 / 1024).toFixed(2)
    const tmp = input.replace(/\.mp4$/, '.opt.mp4')
    await execFileAsync(bin, [
      '-y',
      '-v',
      'error',
      '-i',
      input,
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-profile:v',
      'high',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '18',
      '-g',
      '4',
      '-keyint_min',
      '4',
      '-sc_threshold',
      '0',
      '-bf',
      '0',
      '-movflags',
      '+faststart',
      tmp,
    ])
    renameSync(tmp, input)
    const afterMb = (statSync(input).size / 1024 / 1024).toFixed(2)
    console.log(`[scrub-opt] ${input.split('/public/')[1]}: ${beforeMb} MB -> ${afterMb} MB`)
  }),
)
console.log('[scrub-opt] Listo.')
