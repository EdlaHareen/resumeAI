#!/usr/bin/env bash
set -e

# Install Python dependencies
pip install -r requirements.txt

# Install tectonic (LaTeX compiler for PDF generation)
TECTONIC_VERSION="0.15.0"
TECTONIC_URL="https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${TECTONIC_VERSION}/tectonic-${TECTONIC_VERSION}-x86_64-unknown-linux-musl.tar.gz"

echo "BUILD CWD: $(pwd)"
echo "Installing tectonic ${TECTONIC_VERSION} to $(pwd)/bin ..."
mkdir -p "./bin"
curl -fsSL "$TECTONIC_URL" | tar -xz -C "./bin"
chmod +x "./bin/tectonic"
echo "Contents of ./bin: $(ls -la ./bin/)"
echo "tectonic installed: $(./bin/tectonic --version)"
