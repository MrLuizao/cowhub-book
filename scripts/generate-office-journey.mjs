#!/usr/bin/env node
/**
 * Genera un recorrido continuo 3D en primera persona (6 clips encadenados de 8s)
 * usando Gemini Omni Flash (gemini-omni-1.2-flash) vía Interactions API,
 * partiendo de la foto de referencia de Unsplash (scripts/assets/office-reference.jpg).
 *
 * El último frame de cada clip se extrae automáticamente con ffmpeg y se pasa
 * como frame inicial del siguiente, creando un plano secuencia continuo.
 *
 * Uso:
 *   node scripts/generate-office-journey.mjs
 *   node scripts/generate-office-journey.mjs --from 3     # reanuda desde el clip 3
 *   node scripts/generate-office-journey.mjs --set office # nombre del set de salida
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Carga sencilla de .env si existe
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
}

const API_KEY = process.env.GEMINI_API_KEY
const MODEL = process.env.VIDEO_MODEL || 'gemini-omni-1.2-flash'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

const args = process.argv.slice(2)
const getArg = (flag, fallback) => {
  const idx = args.indexOf(flag)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback
}

const FROM_CLIP = Number(getArg('--from', '1'))
const SET_NAME = getArg('--set', 'office')
const RAW_DIR = resolve('.cache', `${SET_NAME}-raw`)
const REF_IMG = resolve('scripts/assets/office-reference.jpg')

const STYLE_LOCK =
  'Generate an 8-second, 16:9 widescreen, 1080p, 24fps silent architectural video. Continuous first-person steadicam walkthrough at eye level (1.55m), smooth constant walking speed, 24mm lens, no cuts, no sudden jumps, no people, no text, no logos. Start directly from the exact provided image as the first frame and preserve its exact modern Scandinavian-industrial luxury business center aesthetic: deep matte slate-blue petrol walls, crisp white linear slatted acoustic ceiling with warm cylindrical recessed spotlights and matte-black dome pendant lamps with warm gold interiors, floor-to-ceiling black steel-framed glass partitions, smooth poured warm taupe-beige microcement floor, smoked-oak wood furniture, muted teal-sage upholstery, realistic natural daylight mixed with warm architectural tungsten glow.'

const CLIPS = [
  {
    id: 1,
    name: 'recepcion',
    prompt: `${STYLE_LOCK} Starting from this exact reception entrance hall frame, glide smoothly forward down the central polished microcement corridor lined with black steel-framed glass office walls and black pendant lamps overhead, approaching an open glass doorway on the right leading into a sunlit coworking hall.`,
  },
  {
    id: 2,
    name: 'coworking',
    prompt: `${STYLE_LOCK} Continuing seamlessly from this exact frame, turn gently right through the open glass doorway into a spacious flexible coworking hall with long smoked-oak communal desks, matte-black ergonomic chairs, warm brass task lamps, and tall black-framed windows letting in soft daylight, gliding forward toward a glass-walled executive boardroom ahead.`,
  },
  {
    id: 3,
    name: 'salas',
    prompt: `${STYLE_LOCK} Continuing seamlessly from this exact frame, pass through the black steel-framed glass doorway into a luxury executive boardroom, gliding smoothly alongside the smoked-oak conference table and sleek black leather chairs, showcasing a frameless 4K display on the deep slate-blue wall and warm amber pendant lights overhead, moving toward the opposite glass exit leading to the auditorium.`,
  },
  {
    id: 4,
    name: 'auditorio',
    prompt: `${STYLE_LOCK} Continuing seamlessly from this exact frame, enter a boutique corporate auditorium with slate-blue vertical acoustic walls and linear warm LED strips across the white slatted ceiling, gliding gently along the stepped microcement aisle flanked by charcoal and muted teal-sage theater seats facing a smoked-oak stage, curving smoothly toward the lounge exit.`,
  },
  {
    id: 5,
    name: 'cafe',
    prompt: `${STYLE_LOCK} Continuing seamlessly from this exact frame, move into the community specialty coffee bar and lounge, gliding past matte-black and dark charcoal built-in cabinetry with a gleaming stainless-steel espresso machine, smoked-oak counter and open shelving with ceramic cups, and a muted teal-sage banquette, turning gently toward tall open black-framed glass terrace doors glowing with golden-hour light.`,
  },
  {
    id: 6,
    name: 'terraza',
    prompt: `${STYLE_LOCK} Continuing seamlessly from this exact frame, pass through the tall open black steel-framed glass doors from the warm interior out onto a luxury rooftop business terrace at golden hour, gliding smoothly under a matte-black architectural pergola with warm linear lighting, past smoked-oak outdoor lounge seating with muted teal cushions and olive-tree planters, revealing a serene sunset view over a modern tree-lined boulevard.`,
  },
]

function requireApiKey() {
  if (!API_KEY) {
    console.error('Falta GEMINI_API_KEY. Defínela en .env o en tu terminal:')
    console.error('  GEMINI_API_KEY=tu_clave node scripts/generate-office-journey.mjs')
    process.exit(1)
  }
}

function extractLastFrame(videoPath, outImgPath) {
  execFileSync(
    'ffmpeg',
    ['-y', '-hide_banner', '-loglevel', 'error', '-sseof', '-0.08', '-i', videoPath, '-frames:v', '1', '-q:v', '2', outImgPath],
    { stdio: 'inherit' },
  )
}

function findVideoPayload(obj) {
  if (!obj || typeof obj !== 'object') return null
  if (obj.type === 'video' && (obj.data || obj.uri)) return { data: obj.data, uri: obj.uri }
  if (typeof obj.mime_type === 'string' && obj.mime_type.startsWith('video/') && (obj.data || obj.uri)) {
    return { data: obj.data, uri: obj.uri }
  }
  if (typeof obj.mimeType === 'string' && obj.mimeType.startsWith('video/') && (obj.data || obj.uri)) {
    return { data: obj.data, uri: obj.uri }
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const hit = findVideoPayload(item)
      if (hit) return hit
    }
    return null
  }
  for (const val of Object.values(obj)) {
    const hit = findVideoPayload(val)
    if (hit) return hit
  }
  return null
}

async function generateClip(clip, startImagePath, outVideoPath) {
  const imageBytes = readFileSync(startImagePath).toString('base64')
  const url = `${BASE_URL}/interactions`

  console.log(`\n▶ [${clip.id}/6] Generando ${clip.name} con ${MODEL}...`)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify({
      model: MODEL,
      input: [
        { type: 'text', text: clip.prompt },
        { type: 'image', mime_type: 'image/jpeg', data: imageBytes },
      ],
      response_modalities: ['video'],
      background: true,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Error iniciando interacción (${res.status}): ${errText}`)
  }

  let interaction = await res.json()
  const interactionId = interaction.id
  if (!interactionId) {
    throw new Error(`Respuesta inesperada sin interaction.id: ${JSON.stringify(interaction).slice(0, 500)}`)
  }

  // Poll hasta completar
  while (interaction.status === 'in_progress' || interaction.status === 'queued' || interaction.status === 'running') {
    await new Promise((r) => setTimeout(r, 8_000))
    const pollRes = await fetch(`${BASE_URL}/interactions/${encodeURIComponent(interactionId)}`, {
      headers: { 'x-goog-api-key': API_KEY },
    })
    if (!pollRes.ok) {
      throw new Error(`Error consultando interacción (${pollRes.status}): ${await pollRes.text()}`)
    }
    interaction = await pollRes.json()
    process.stdout.write('.')
  }
  process.stdout.write('\n')

  if (interaction.status === 'failed' || interaction.error) {
    const clean = JSON.stringify(
      interaction,
      (k, v) => (k === 'data' && typeof v === 'string' && v.length > 80 ? `<base64:${v.length}chars>` : v),
      2,
    )
    throw new Error(`Generación falló en clip ${clip.id}:\n${clean}`)
  }

  const video = findVideoPayload(interaction)
  if (!video) {
    throw new Error(
      `No se encontró video en la respuesta (status=${interaction.status}): ${JSON.stringify(interaction).slice(0, 1200)}`,
    )
  }

  if (video.data) {
    writeFileSync(outVideoPath, Buffer.from(video.data, 'base64'))
  } else if (video.uri) {
    const dlRes = await fetch(video.uri, {
      headers: { 'x-goog-api-key': API_KEY },
      redirect: 'follow',
    })
    if (!dlRes.ok) throw new Error(`Error descargando video (${dlRes.status})`)
    writeFileSync(outVideoPath, Buffer.from(await dlRes.arrayBuffer()))
  }

  console.log(`✓ Clip ${clip.id} guardado en ${outVideoPath}`)
}

async function main() {
  requireApiKey()
  const inspectId = getArg('--inspect', '')
  if (inspectId) {
    const r = await fetch(`${BASE_URL}/interactions/${encodeURIComponent(inspectId)}`, {
      headers: { 'x-goog-api-key': API_KEY },
    })
    const j = await r.json()
    console.log(
      JSON.stringify(
        j,
        (k, v) => (k === 'data' && typeof v === 'string' && v.length > 80 ? `<base64:${v.length}chars>` : v),
        2,
      ),
    )
    return
  }
  if (!existsSync(REF_IMG)) {
    throw new Error(`No se encontró la imagen de referencia: ${REF_IMG}`)
  }

  mkdirSync(RAW_DIR, { recursive: true })

  for (const clip of CLIPS) {
    const outVideo = resolve(RAW_DIR, `paseo-${clip.id}.mp4`)
    const lastFrameOut = resolve(RAW_DIR, `last-frame-${clip.id}.jpg`)
    const startImage = clip.id === 1 ? REF_IMG : resolve(RAW_DIR, `last-frame-${clip.id - 1}.jpg`)

    if (clip.id < FROM_CLIP) {
      if (!existsSync(lastFrameOut) && existsSync(outVideo)) {
        extractLastFrame(outVideo, lastFrameOut)
      }
      console.log(`↷ Saltando clip ${clip.id} (--from ${FROM_CLIP})`)
      continue
    }

    if (!existsSync(startImage)) {
      throw new Error(`Falta el frame inicial para el clip ${clip.id}: ${startImage}`)
    }

    await generateClip(clip, startImage, outVideo)
    extractLastFrame(outVideo, lastFrameOut)
  }

  console.log('\n▶ Normalizando los 6 clips para scroll-scrubbing con ffmpeg...')
  execFileSync('bash', ['scripts/prepare-journey-videos.sh', '--dir', RAW_DIR, '--set', SET_NAME], {
    stdio: 'inherit',
  })
  console.log('\n✔ Recorrido continuo 3D listo.')
}

main().catch((err) => {
  console.error('\n✖ Error:', err.message)
  process.exit(1)
})
