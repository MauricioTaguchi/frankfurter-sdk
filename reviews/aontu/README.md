# Aontu critical review

[Read the article](./ARTICLE.md).

This review examines Aontu 0.76.0 through eight focused, executable checks. It accompanies the second Voxgig mini task. The article and original examples are covered by the repository's MIT license.

## Reproduce

Use Node 24 or later:

```sh
cd reviews/aontu
npm ci --ignore-scripts
npm test
```

`npm test` exits unsuccessfully if an expected behaviour differs. The checked-in `verification.json` records one successful run on Node 24.19.0. Negative examples are successful checks when Aontu rejects the input as expected.

The article's JavaScript blocks form one sequence; `check.cjs` contains the standalone assertions and additional boundary cases. The install snippet starts a separate scratch project, while this directory uses its committed lockfile.

## Scope

Tested: JavaScript API generation and validation; defaults, literal conflicts, type mismatches, open and closed maps, omitted fields, and an explicit numeric range. These checks use `trust.include: 'none'` because the examples need no external includes.

Not evaluated: Go parity, performance, remote/package includes, editor tooling, every language feature, or production reliability. No claim is made about measuring the candidate's human work time. Keep any personal review or revision within the exercise's 30-minute human-work limit.

The evaluation covers version 0.76.0. Documentation on the upstream default branch can describe newer behaviour, so the article uses versioned references.
