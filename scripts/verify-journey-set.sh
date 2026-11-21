#!/usr/bin/env bash
# Audita que un set de videos del recorrido ('demo' | 'office' | ...) cumpla
# con el contrato exacto de public/video/paseo-1..6.mp4:
#   - 6 videos .mp4 + 6 posters .jpg
#   - h264 High L4.0, 1920x1080, 24/1 fps, yuv420p, sin audio (nb_streams=1)
#   - color_range=tv, color_space=bt709, color_primaries=bt709, color_transfer=iec61966-2-1
#   - keyframes cada 0.25 s
#   - continuidad frame-a-frame (SSIM entre último frame de N y primer frame de N+1)
#
# Uso:
#   bash scripts/verify-journey-set.sh demo
#   bash scripts/verify-journey-set.sh office

set -euo pipefail

SET_NAME="${1:-office}"

if [[ "$SET_NAME" == "demo" ]]; then
  VID_DIR="public/video"
  IMG_DIR="public/img"
else
  VID_DIR="public/video/${SET_NAME}"
  IMG_DIR="public/img/${SET_NAME}"
fi

echo "=== Auditando set '${SET_NAME}' (${VID_DIR}) ==="

FAIL=0
CONT_WARN=0

check_eq() {
  local label="$1"
  local got="$2"
  local want="$3"
  if [[ "$got" != "$want" ]]; then
    echo "  ✖ ${label}: esperado '${want}', obtenido '${got}'"
    FAIL=1
  fi
}

for i in 1 2 3 4 5 6; do
  MP4="${VID_DIR}/paseo-${i}.mp4"
  JPG="${IMG_DIR}/paseo-${i}.jpg"

  if [[ ! -f "$MP4" ]]; then
    echo "✖ Falta video: $MP4"
    FAIL=1
    continue
  fi
  if [[ ! -f "$JPG" ]]; then
    echo "✖ Falta poster: $JPG"
    FAIL=1
  fi

  NB_STREAMS="$(ffprobe -v error -show_entries format=nb_streams -of csv=p=0 "$MP4")"
  META="$(ffprobe -v error -select_streams v:0 \
    -show_entries stream=codec_name,profile,level,width,height,pix_fmt,color_range,color_space,color_primaries,color_transfer,r_frame_rate,nb_frames,duration \
    -of default=noprint_wrappers=1 "$MP4")"

  get_field() {
    echo "$META" | awk -F= -v k="$1" '$1 == k { print $2; exit }'
  }

  CODEC="$(get_field codec_name)"
  PROFILE="$(get_field profile)"
  LEVEL="$(get_field level)"
  W="$(get_field width)"
  H="$(get_field height)"
  PIX="$(get_field pix_fmt)"
  CRANGE="$(get_field color_range)"
  CSPACE="$(get_field color_space)"
  CPRIM="$(get_field color_primaries)"
  CTRC="$(get_field color_transfer)"
  FPS="$(get_field r_frame_rate)"
  NFRAMES="$(get_field nb_frames)"
  DUR="$(get_field duration)"

  # Verificar que el segundo keyframe esté en 0.250000 s
  KF2="$(ffprobe -v error -select_streams v:0 -skip_frame nokey -show_entries frame=pts_time -of csv=p=0 "$MP4" | sed -n '2p' | tr -d ',')"

  echo "paseo-${i}.mp4: ${CODEC} ${PROFILE} L${LEVEL} | ${W}x${H} @ ${FPS} | ${DUR}s (${NFRAMES}f) | ${PIX} ${CSPACE}/${CTRC} | kf2=${KF2}s"

  check_eq "paseo-${i} nb_streams (sin audio)" "$NB_STREAMS" "1"
  check_eq "paseo-${i} codec" "$CODEC" "h264"
  check_eq "paseo-${i} profile" "$PROFILE" "High"
  check_eq "paseo-${i} level" "$LEVEL" "40"
  check_eq "paseo-${i} width" "$W" "1920"
  check_eq "paseo-${i} height" "$H" "1080"
  check_eq "paseo-${i} pix_fmt" "$PIX" "yuv420p"
  check_eq "paseo-${i} color_range" "$CRANGE" "tv"
  check_eq "paseo-${i} color_space" "$CSPACE" "bt709"
  check_eq "paseo-${i} color_primaries" "$CPRIM" "bt709"
  check_eq "paseo-${i} color_transfer" "$CTRC" "iec61966-2-1"
  check_eq "paseo-${i} fps" "$FPS" "24/1"
  check_eq "paseo-${i} keyframe_interval" "$KF2" "0.250000"
done

echo "--- Continuidad frame a frame (SSIM entre fin de clip N e inicio de clip N+1) ---"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

for i in 1 2 3 4 5; do
  NEXT=$((i + 1))
  A="${VID_DIR}/paseo-${i}.mp4"
  B="${VID_DIR}/paseo-${NEXT}.mp4"
  if [[ -f "$A" && -f "$B" ]]; then
    ffmpeg -y -hide_banner -loglevel error -sseof -0.05 -i "$A" -frames:v 1 "$TMP_DIR/a.png"
    ffmpeg -y -hide_banner -loglevel error -i "$B" -frames:v 1 "$TMP_DIR/b.png"
    SSIM="$(ffmpeg -i "$TMP_DIR/a.png" -i "$TMP_DIR/b.png" -lavfi ssim -f null - 2>&1 | sed -n 's/.*All:\([0-9.]*\).*/\1/p' | tail -n 1)"
    OK="$(awk -v s="${SSIM:-0}" 'BEGIN { print (s >= 0.85) ? "OK" : "CORTE" }')"
    if [[ "$OK" == "OK" ]]; then
      echo "  ✓ paseo-${i} -> paseo-${NEXT}: SSIM=${SSIM} (continuo)"
    else
      echo "  ⚠ paseo-${i} -> paseo-${NEXT}: SSIM=${SSIM} (corte entre escenas — aún no es plano secuencia continuo)"
      CONT_WARN=1
    fi
  fi
done

if [[ "$FAIL" -ne 0 ]]; then
  echo "✖ Auditoría técnica FALLÓ para '${SET_NAME}'."
  exit 1
fi

if [[ "$CONT_WARN" -ne 0 ]]; then
  echo "⚠ Formato técnico 100% idéntico, pero faltan clips continuos 3D (SSIM < 0.85)."
  exit 0
fi

echo "✔ Paridad técnica y continuidad 3D: 100% OK para '${SET_NAME}'."
