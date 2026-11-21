#!/usr/bin/env bash
# Normaliza 1 video continuo (lo divide en 6 segmentos encadenados) o 6 clips
# existentes al formato óptimo de scroll-scrubbing para ScrollJourney.vue:
#   - 1920x1080, 24 fps, H.264 (yuv420p, color_range tv), sin audio
#   - Keyframes exactos cada 6 frames (0.25 s): -g 6 -keyint_min 6 -bf 0
#   - Poster frame-0 exacto en public/img/<set>/paseo-1..6.jpg
#
# Uso:
#   bash scripts/prepare-journey-videos.sh --single ruta/recorrido-48s.mp4 [--set office]
#   bash scripts/prepare-journey-videos.sh --dir .cache/office-raw        [--set office]

set -euo pipefail

MODE=""
INPUT=""
SET_NAME="office"
SEGMENTS=6

while [[ $# -gt 0 ]]; do
  case "$1" in
    --single) MODE="single"; INPUT="${2:-}"; shift 2 ;;
    --dir)    MODE="dir";    INPUT="${2:-}"; shift 2 ;;
    --set)    SET_NAME="${2:-office}"; shift 2 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "Argumento desconocido: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$MODE" || -z "$INPUT" ]]; then
  echo "Uso:" >&2
  echo "  $0 --single <video-continuo.mp4> [--set office]" >&2
  echo "  $0 --dir <carpeta-con-paseo-1..6.mp4> [--set office]" >&2
  exit 1
fi

OUT_VID="public/video/${SET_NAME}"
OUT_IMG="public/img/${SET_NAME}"
mkdir -p "$OUT_VID" "$OUT_IMG"

VF_SCALE="scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,fps=24,format=yuv420p,setparams=range=tv:color_primaries=bt709:color_trc=iec61966-2-1:colorspace=bt709"

encode_segment() {
  local src="$1"
  local idx="$2"
  local ss_args=("${@:3}")
  local tmp_mp4="${OUT_VID}/.paseo-${idx}.tmp.mp4"
  local dst_mp4="${OUT_VID}/paseo-${idx}.mp4"
  local dst_jpg="${OUT_IMG}/paseo-${idx}.jpg"

  ffmpeg -y -hide_banner -loglevel error \
    ${ss_args[@]+"${ss_args[@]}"} \
    -i "$src" \
    -an \
    -vf "$VF_SCALE" \
    -c:v libx264 -profile:v high -level:v 4.0 -crf 20 -preset medium \
    -pix_fmt yuv420p -color_range tv \
    -colorspace bt709 -color_primaries bt709 -color_trc iec61966-2-1 \
    -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 \
    -movflags +faststart \
    "$tmp_mp4"

  mv "$tmp_mp4" "$dst_mp4"

  # Poster exacto del frame 0 para transición sin salto
  ffmpeg -y -hide_banner -loglevel error \
    -i "$dst_mp4" -frames:v 1 -q:v 2 "$dst_jpg"

  echo "✓ ${dst_mp4} + ${dst_jpg}"
}

if [[ "$MODE" == "single" ]]; then
  if [[ ! -f "$INPUT" ]]; then
    echo "No existe el archivo: $INPUT" >&2
    exit 1
  fi
  TOTAL_DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$INPUT")"
  SEG_DUR="$(awk -v d="$TOTAL_DUR" -v n="$SEGMENTS" 'BEGIN { printf "%.6f", d / n }')"
  echo "Dividiendo ${INPUT} (${TOTAL_DUR}s) en ${SEGMENTS} segmentos de ${SEG_DUR}s -> set '${SET_NAME}'..."

  for i in $(seq 1 "$SEGMENTS"); do
    START="$(awk -v i="$i" -v s="$SEG_DUR" 'BEGIN { printf "%.6f", (i - 1) * s }')"
    encode_segment "$INPUT" "$i" -ss "$START" -t "$SEG_DUR"
  done
elif [[ "$MODE" == "dir" ]]; then
  if [[ ! -d "$INPUT" ]]; then
    echo "No existe la carpeta: $INPUT" >&2
    exit 1
  fi
  echo "Normalizando ${SEGMENTS} clips desde ${INPUT} -> set '${SET_NAME}'..."
  for i in $(seq 1 "$SEGMENTS"); do
    SRC="${INPUT}/paseo-${i}.mp4"
    if [[ ! -f "$SRC" ]]; then
      echo "Falta el archivo: $SRC" >&2
      exit 1
    fi
    encode_segment "$SRC" "$i"
  done
fi

echo "Listo. Metadatos finales en ${OUT_VID}:"
for f in "${OUT_VID}"/paseo-*.mp4; do
  printf "  %s -> " "$f"
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,duration \
    -of csv=p=0 "$f"
done
