# Reproduce the SDK and checks

Use Node.js 24 or later. No API key is required. This repository does not contain credentials.

## Versions used

| Component | Version |
| --- | --- |
| Node.js | 24.19.0 |
| @voxgig/create-sdkgen | 0.30.7 |
| @voxgig/sdkgen | 4.34.7 |
| @voxgig/apidef | 8.25.2 |
| @voxgig/model | 12.0.1 |
| @voxgig/docgen | 0.30.1 |
| aontu | 0.76.0 |

The committed lockfiles capture the installed dependency versions.

## Original scaffold command

The official specification is preserved at `.sdk/def/frankfurter-openapi.json`.

```sh
npm exec --yes --package=@voxgig/create-sdkgen@0.30.7 -- \
  create-sdkgen frankfurter -d ./frankfurter-openapi.json \
  -o ./frankfurter-sdk -t ts -f test
```

SHA-256 of the specification:
`2f3e6a4012b8461401e462237ef4f5122fd6cf71b766db948fe86fd696745fe4`.

## From this checkout

```sh
cd .sdk
npm ci
npm run generate
npx --no-install voxgig-sdkgen doctor
cd ../ts
npm ci
npm test
cd ..
node scripts/smoke-live.cjs
```

If your environment requires its already-configured HTTP proxy, Node 24 supports `node --use-env-proxy scripts/smoke-live.cjs`. That flag was used for the recorded live run. Do not change proxy or TLS settings unnecessarily.

The smoke script invokes generated entity methods, checks the filtered list against the single rate, and uses `direct()` to validate a real error response. A failure exits nonzero. It does not modify remote data.

## Observed results

- Build and tests: 249 total, 237 passed, 12 skipped, zero failed.
- Skipped tests: optional validate, timeout, retry, netsim, ratelimit and cost features not enabled in this project.
- Doctor: `.sdk matches the scaffold (0 additive)`.
- Live historical rate: EUR/BRL, 2026-10-01, 5.8804.
- Live filtered list: one item, matching the single-rate response.
- Live currencies: 165 returned at execution time; the script asserts a nonempty list, not a fixed count.
- Invalid currency: HTTP 422.

Selected output is retained in `evidence/`. Full generated tests are included. A clean GitHub Actions run has not yet been observed; local checks are the evidence reported here.

