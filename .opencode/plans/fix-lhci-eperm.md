# Fix LHCI EPERM on WSL

## Problem
`chrome-launcher` creates temp files in `C:\Users\...\AppData\Local\Temp\lighthouse.*`. When the WSL Node.js process tries to clean them up (`rmSync`), it hits `EPERM` because the Linux process lacks Windows permissions for those files.

## Fix

### Option A — Set TMPDIR at runtime (easiest)

```bash
mkdir -p /tmp/lhci
TMPDIR=/tmp/lhci npx lhci autorun
```

This redirects Chrome's temp directory to a WSL-native path where the Node.js process has full ownership.

### Option B — Bake TMPDIR into lighthouserc.json

Add to `lighthouserc.json` `collect.settings`:
```json
"settings": {
  "preset": "desktop",
  "chromeFlags": "--no-sandbox --disable-gpu"
}
```

Then update the npm script in `package.json`:
```json
"lhci": "mkdir -p /tmp/lhci && TMPDIR=/tmp/lhci lhci autorun"
```

### Option C — Use WSL Chrome instead of Windows Chrome

If Chrome is installed in WSL:
```bash
which google-chrome-stable  # find WSL Chrome path
export CHROME_PATH=/usr/bin/google-chrome-stable
npx lhci autorun
```

No temp dir conflict when both Node.js and Chrome run on the same filesystem.

---

## Verify

```bash
mkdir -p /tmp/lhci
TMPDIR=/tmp/lhci npx lhci autorun 2>&1 | grep -i error
```

Should see zero EPERM errors. Reports land in `./lhci-reports/`.
