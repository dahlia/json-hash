#!/bin/bash
set -e
kernel="$(uname -s | tr '[:upper:]' '[:lower:]')"
machine="$(uname -m | tr '[:upper:]' '[:lower:]')"
if [[ "$machine" = "x86_64" ]]; then
  machine=amd64
fi
if [[ "$kernel" = mingw* ]]; then
  kernel=windows
  suffix=.exe
fi
goarch="$kernel-$machine"
bin="ec-$goarch$suffix"
download_url="https://github.com/editorconfig-checker/editorconfig-checker/releases/download/2.4.0/$bin.tar.gz"  # editorconfig-checker-disable-line
bin_dir="$(dirname "$0")/bin"
if [[ ! -f "$bin_dir/$bin" ]]; then
  pushd "$(dirname "$0")"
  if command -v wget > /dev/null; then
    wget "$download_url"
  else
    curl -LO "$download_url"
  fi
  tar xvfz "$bin.tar.gz"
  rm "$bin.tar.gz"
  popd
fi
"$bin_dir/$bin" "$@"
