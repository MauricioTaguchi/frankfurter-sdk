# A reproducible first run

This hand-maintained guide complements the generated README. The package is not published to npm: install from a source checkout. This is an unofficial SDK, independent of the upstream API provider.

## Install and test

Use Node.js 24 and the committed lockfile:

```sh
git clone https://github.com/MauricioTaguchi/frankfurter-sdk.git
cd frankfurter-sdk
npm ci --prefix ts
npm test --prefix ts
node scripts/quickstart-offline.cjs
```

The package's pretest script builds the SDK. The last command imports that real build, checks an empty mock and then a synthetic BRL record. It rejects unexpected calls to fetch. Expected output:

```text
PASS: empty mock, seeded BRL record and zero network calls.
```

A mock record is not an exchange-rate observation and does not establish live API availability. No credentials are required.

## Equivalent offline usage

Run this from the repository root after building:

```js
const { FrankfurterSDK } = require('./ts/dist/FrankfurterSDK.js');

async function main() {
  const client = FrankfurterSDK.test({
    entity: { currency: { BRL: { id: 'BRL', code: 'BRL' } } },
  });
  const currencies = await client.Currency().list();
  console.log(currencies.map(currency => currency.data()));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
```

The mock starts empty. Seed the records needed for each test rather than assuming that test mode contains real currencies.

## Opt-in live check

The existing script exercises the generated entity methods against the public API:

```sh
node scripts/smoke-live.cjs
```

It checks EUR/BRL for the historical date 2026-10-01, compares single-rate and filtered-list responses, reads currencies and validates an invalid-currency response. This requires network access, performs read-only requests and exits nonzero on failure. It does not retrieve today's rate. Do not assert a permanently fixed currency count or exchange-rate value.

The example uses concrete values rather than generated placeholders:

```js
const { FrankfurterSDK } = require('./ts/dist/FrankfurterSDK.js');

async function main() {
  const client = new FrankfurterSDK();
  const rate = await client.Rate().load({
    base: 'EUR', quote: 'BRL', date: '2026-10-01',
  });
  console.log(rate.data());
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
```

## Evidence and maintenance

Compilation, mocked behavior and live integration are different checks. Read the actual workflow result before claiming success. Historical observations in VERIFICATION.md are not a new test run.

The companion workflow installs locked dependencies, runs the existing suite and executes the offline example. It does not call the live API or publish a package.

The ts directory is generated output. This guide and the script deliberately live outside it. Fixing the generator's placeholders requires a change to its model, templates or components, followed by regeneration; this companion does not claim to make that upstream fix.

## Troubleshooting

- Missing ts/dist/FrankfurterSDK.js: run npm ci --prefix ts and npm test --prefix ts first.
- Empty mock list: seed the records your example needs.
- Installation failure: check Node version and registry access; do not delete the lockfile to hide a mismatch.
- A live failure: retain the error and distinguish network availability from client behavior. Do not disable TLS verification.
