# Contributing and maintaining evidence

Start with [QUICKSTART.md](QUICKSTART.md) for installation from source. The npm package is not published. This is an unofficial project, not an endorsed upstream client.

## A small, reproducible change

Describe the behavior, the exact command, the expected result and the observed result. Include Node/npm versions and the commit tested. Use synthetic fixtures and never paste credentials, private correspondence or customer data.

Before changing runtime code, add a regression test that fails for the reported behavior. Keep documentation-only changes small and verify every command you add.

## Generated code boundary

`ts/` is generated output. For generated behavior, update the appropriate model, template or component under `.sdk/`, regenerate according to [AGENTS.md](AGENTS.md), review the diff and rerun tests. Do not hand-edit generated output and call it a durable generator fix. The hand-maintained quickstart and scripts remain outside that output.

## Offline checks

With Node.js 24, from the repository root:

```sh
npm ci --prefix ts
npm test --prefix ts
node scripts/quickstart-offline.cjs
```

The quickstart uses the compiled SDK and synthetic fixtures. Unexpected fetch calls fail it. The read-only Quickstart verification workflow runs for relevant changes and on main. Read its actual result; an old green run does not validate a new commit.

## Separate live verification

```sh
node scripts/smoke-live.cjs
```

This is an opt-in read-only public API check. No API key is needed. It compares the historical EUR/BRL single-rate and list responses for 2026-10-01, checks a nonempty currency list and validates an invalid-currency error. It does not execute a trade, use today's rate or assert a permanently fixed rate/count.

The separate Live API verification workflow can be started manually and runs on pull requests that change its workflow or smoke script. It has a bounded timeout and is not scheduled. It can fail because of the network, API availability, provider changes or a client regression; inspect the actual error rather than substituting a mock or concealing the failure.

## Pull request evidence

State what changed, the commands actually run, pass/fail/skip counts, any network use, and remaining limitations. A passing live run is evidence for that execution, not an availability guarantee. Keep historical observations in VERIFICATION.md separate from new evidence. Never fabricate test results or claim an upstream contribution merely because a change was merged into this personal repository.
