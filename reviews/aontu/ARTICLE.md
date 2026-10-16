# Aontu: what a passing validation result actually guarantees

By Maurício Taguchi | 16 October 2026

Aontu lets a configuration document contain values, defaults and constraints. That is useful for a generator: several files can describe a project, and incompatible declarations can stop the build before they become inconsistent generated code. My concern is what happens when a developer reads a successful validation as a stronger guarantee than the model provides.

I examined that boundary using Aontu 0.76.0, the version installed while generating the Frankfurter SDK. Eight small checks cover defaults, conflicting values, misspelled keys, missing fields and numeric bounds. They run on Node 24.19.0. This is a review of those behaviours, not a performance benchmark or a production deployment report. The examples and captured results are included alongside this article.

Start with a clean directory and a pinned dependency:

```sh
npm init -y
npm install --save-exact aontu@0.76.0
```

The following is a complete CommonJS example:

```js
const { Aontu, vet } = require('aontu');
const options = { trust: { include: 'none' } };
const engine = new Aontu(options);

const schema = 'service: {port: *8080 | integer}';
console.log(engine.generate(schema + '\nservice: {port: 9090}'));
// { service: { port: 9090 } }
```

The asterisk makes 8080 a preferred value. A supplied integer can refine that default. Replace the first declaration with `service: {port: 8080}`, however, and the second declaration produces a conflict. A literal pins the value. Putting another literal later in the document does not replace it.

That difference is useful when two generator components disagree about a shared setting. JavaScript object spread would accept the later value; Aontu makes the disagreement visible. But familiar object syntax can invite the wrong expectation. Someone migrating configuration overlays needs to classify each field deliberately: fixed value, default, or requirement. Translating the punctuation without reviewing those meanings can turn an intended override into a failed build.

For the conflicting literals, validation reported `scalar_value` at `$.service.port`, with locations for both the schema and the data. Those two locations are actionable evidence. In a configuration assembled from several sources, identifying both declarations is more helpful than reporting only the final value.

A different risk appears when an unintended key is accepted:

```js
const typo = 'service: {prot: 9090}';
console.log(vet(schema, typo, options).verdict);
// valid
console.log(engine.generate(schema + '\n' + typo));
// { service: { port: 8080, prot: 9090 } }
```

The input misspells `port` as `prot`. The declared port receives its default, and the additional key survives. If an application later reads `service.port`, it receives 8080. The person who supplied the configuration may believe they selected 9090. A successful check would then conceal an operational mistake.

This follows Aontu's documented open-map semantics. Separate fragments can add keys, which is convenient while assembling a model. My criticism is about the boundary between composition and validation: flexibility during assembly does not automatically provide a restrictive input contract. The caller must decide which keys are allowed.

Closing the relevant map changes the result:

```js
const strict = 'service: close({port: *8080 | integer})';
const result = vet(strict, typo, options);
console.log(result.verdict, result.findings[0].code);
// invalid closed
```

The finding identifies `$.service.prot`. I would close maps at application input boundaries and keep extension points open only where additional keys have a defined purpose. I would also retain the misspelled-key case as a regression test. A happy-path example cannot demonstrate that this boundary rejects the mistakes it was designed to catch.

A second distinction remains after closing the map. `service: {}` is valid against the defaulted schema, and generation supplies port 8080. Validation has established that the combined document can produce a concrete value. It has not established that the caller explicitly supplied that value. Against `service: close({port: integer})`, the same empty input instead receives an `incomplete` verdict.

These outcomes need different handling. A deployment setting may reasonably use a default; a required acknowledgement should not be manufactured by one. I would decide that policy before writing the schema, then test omitted input separately from invalid input. Calling both cases “bad configuration” loses information that the application may need to present a useful correction.

Types also leave business rules unfinished. A port of -1 passed the integer-only schema in the checks. Adding `min(1)` and `max(65535)` rejected it. For this example, the accepted range is an explicit application policy; a system that permits zero for automatic port selection would need a different rule. Aontu can express the bound, but cannot choose it from the field's name.

Diagnostics deserve similar attention. Supplying `"9090"` to the defaulted integer field produced the code `empty` and the hint “Empty disjunction.” The report included the field path and source sites, so it provided enough evidence to investigate. Still, a developer unfamiliar with unification has to translate the terminology before fixing an ordinary type mismatch. An additional explanation such as “the supplied string matches no allowed alternative” would shorten that step while preserving the precise diagnostic code.

The versioned tutorial already explains defaults and closed maps, including failing examples. The material is there. I would change its entry path: begin with the pinned npm installation and a small decision table showing fixed, defaulted, required and closed declarations. Its current setup begins with a source build inside the repository's `ts/` directory. That is appropriate for contributors, but adds context that a package user does not need for a first experiment.

I would use Aontu for a generator model where several sources must agree and where explicit defaults remove repeated configuration. For a small application with a single configuration object, introducing its evaluation rules may create more learning work than the configuration warrants. Adoption should include negative examples, named input boundaries and version-pinned tests. The useful guarantee is the one those constraints actually encode; the word `valid` cannot make an incomplete contract stronger.

Primary references: [configuration tutorial](https://github.com/aontu-lang/aontu/blob/v0.76.0/docs/tutorial-config.md), [language reference](https://github.com/aontu-lang/aontu/blob/v0.76.0/docs/reference-language.md), [error reference](https://github.com/aontu-lang/aontu/blob/v0.76.0/docs/reference-errors.md), and [trust options](https://github.com/aontu-lang/aontu/blob/v0.76.0/docs/trust.md). All links are pinned to the reviewed version.
