# Frankfurter SDK: developer experience report

Date: 16 October 2026  
Author: Maurício Taguchi

## Scope and result

I chose [Frankfurter](https://frankfurter.dev), an open-source exchange-rate API. Searches for `frankfurter` and `frank` in the `voxgig-sdk` GitHub catalogue returned no repository at the time of selection. Its public API requires no key, which made real requests possible without a trial account or credentials. No authenticated API flow is claimed.

The project uses the official OpenAPI 3.1.2 document, API version 2.1.1, with nine paths. Voxgig generated a TypeScript SDK with four entities: Coverage, Currency, Provider and Rate. Project ownership, repository URLs and the package name are configured in the project model. Generated SDK source was not edited by hand.

The SDK builds successfully. Its generated suite reports **249 tests: 237 passed, 12 skipped, zero failures**. Skips concern features not enabled in this small project. `voxgig-sdkgen doctor` reports that the scaffold matches, with zero additions or drift.

Four live SDK calls passed: loading a historical EUR/BRL rate, checking the equivalent filtered rate list, listing currencies, and checking an invalid-currency response. The historical call returned **5.8804 BRL per EUR for 2026-10-01**, and the invalid request returned **HTTP 422**. These are smoke checks, not exhaustive API validation. Evidence and reproduction commands are in [VERIFICATION.md](VERIFICATION.md).

## What worked well

- Scaffolding accepted the full upstream specification without a hand-written adapter. The entity methods provided a useful starting point, and the SDK correctly mapped the `quote` match field to the API's `quotes` query parameter for the list request.
- The project model provides a clear place for ownership and package settings. Regenerating with those settings kept the generated code consistent and passed the doctor check.
- The supplied tests and executable documentation checks made the first verification quick. The distinction between entity methods that throw and `direct()` results with an `ok` field is documented and useful.

## Friction and recommendations

1. **An inferred sample flow was disabled.** Generation warns that `BasicRateFlow#1 (load)` cannot reach a route. The generated flow provides `base` and `id`, while the rate route needs `base` and `quote`. A direct `Rate().load({ base, quote, date })` call works. Recommend deriving complete sample matches from the selected route, and including the missing parameter names in the warning. I retained the warning rather than changing generator internals within this exercise.
2. **The online agent guide still shows `.aon` paths.** The installed scaffold and current repository guide use `.aontu`. Recommend aligning the website examples with the installed version and linking a versioned quickstart. The repository guide was sufficient to continue.
3. **Generated examples need a clearer live path.** The rate example uses `example_base` and `example_quote`, which are useful placeholders but not valid currencies. Recommend deriving runnable examples from OpenAPI parameter examples, or clearly distinguishing offline examples from a first real request. This project adds a short live smoke script using EUR and BRL.

## Limits and next steps

The scope was one language target, the generated tests and four real read/error requests. Other languages, provider-specific endpoints, coverage data, large time series, retries and throughput were not tested. No npm release was made. The generated source, model and MIT license are included for publication in my own repository.

The logs record automated execution; they do not measure human working time. Any manual review should remain within the requested 30-minute human-work limit. Further feature work was left outside this mini task.

## References

- [Voxgig generator](https://voxgig.com/sdk)
- [Voxgig agent guide](https://voxgig.com/sdk/agents)
- [Current scaffold guide](https://github.com/voxgig/create-sdkgen/blob/main/AGENTS.md)
- [SDK catalogue](https://github.com/orgs/voxgig-sdk/repositories)
- [Official Frankfurter specification](https://api.frankfurter.dev/v2/openapi.json)

