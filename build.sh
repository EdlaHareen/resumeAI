#!/usr/bin/env bash
set -e

# Install Python dependencies
pip install -r requirements.txt

# Install tectonic (LaTeX compiler for PDF generation)
TECTONIC_VERSION="0.15.0"
TECTONIC_URL="https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${TECTONIC_VERSION}/tectonic-${TECTONIC_VERSION}-x86_64-unknown-linux-musl.tar.gz"

echo "Installing tectonic ${TECTONIC_VERSION}..."
mkdir -p "$HOME/bin"
curl -fsSL "$TECTONIC_URL" | tar -xz -C "$HOME/bin"
chmod +x "$HOME/bin/tectonic"
echo "tectonic installed: $($HOME/bin/tectonic --version)"
