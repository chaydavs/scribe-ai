#!/bin/bash
# Reads values from .env.local and loads them into Firebase Secret Manager.
# Run from the repo root: bash scripts/set-firebase-secrets.sh
#
# For each NEW secret you'll see one prompt: "Production or local testing?"
# Just press Enter — Production is the default.

ENV_FILE=".env.local"
PROJECT="scribe-61c08"
BACKEND="my-web-app"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Run from the repo root."
  exit 1
fi

KEYS=(
  ANTHROPIC_API_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_APP_URL
  PAYPAL_CLIENT_ID
  PAYPAL_CLIENT_SECRET
  # Firebase Storage (Phase 2 — skipped if not in .env.local)
  FIREBASE_STORAGE_BUCKET
  FIREBASE_CLIENT_EMAIL
  FIREBASE_PRIVATE_KEY
)

TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT

for KEY in "${KEYS[@]}"; do
  # Skip comment lines
  [[ "$KEY" == \#* ]] && continue

  VALUE=$(grep "^${KEY}=" "$ENV_FILE" | head -1 | cut -d= -f2-)
  if [ -n "$VALUE" ]; then
    # Write value to temp file — keeps stdin as TTY so the production/local prompt works
    printf '%s' "$VALUE" > "$TMPFILE"
    echo ""
    echo "→ Setting $KEY"
    firebase apphosting:secrets:set "$KEY" \
      --data-file "$TMPFILE" \
      --project "$PROJECT" \
      --force
    # Ensure the backend can access it
    firebase apphosting:secrets:grantaccess "$KEY" \
      --backend "$BACKEND" \
      --project "$PROJECT" 2>/dev/null
    echo "✓ $KEY done"
  else
    echo "⚠ SKIPPED $KEY (not found in $ENV_FILE)"
  fi
done

echo ""
echo "All done. Push to main to trigger a deploy."
