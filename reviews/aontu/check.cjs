'use strict';

const assert = require('node:assert/strict');
const { Aontu, vet } = require('aontu');
const version = require('aontu/package.json').version;
const options = { trust: { include: 'none' } };
const engine = new Aontu(options);
const results = [];

function check(name, run) {
  const observed = run();
  results.push({ name, passed: true, observed });
}

const openSchema = 'service: {port: *8080 | integer}';
const closedSchema = 'service: close({port: *8080 | integer})';
const typo = 'service: {prot: 9090}';

check('A concrete value refines a default', () => {
  const out = engine.generate(openSchema + '\nservice: {port: 9090}');
  assert.deepEqual(out, { service: { port: 9090 } });
  return out;
});

check('Conflicting literals fail with both source sites', () => {
  const report = vet('service: {port: 8080}', 'service: {port: 9090}', options);
  assert.equal(report.verdict, 'invalid');
  assert.equal(report.findings[0].code, 'scalar_value');
  assert.equal(report.findings[0].path, '$.service.port');
  assert.deepEqual(new Set(report.findings[0].sites.map(s => s.role)), new Set(['schema', 'data']));
  return report;
});

check('A quoted number is invalid, with an empty-disjunction diagnostic', () => {
  const report = vet(openSchema, 'service: {port: "9090"}', options);
  assert.equal(report.verdict, 'invalid');
  assert.equal(report.findings[0].code, 'empty');
  assert.equal(report.findings[0].path, '$.service.port');
  return report;
});

check('An open map admits a misspelled key and supplies the default', () => {
  const report = vet(openSchema, typo, options);
  const out = engine.generate(openSchema + '\n' + typo);
  assert.equal(report.verdict, 'valid');
  assert.deepEqual(out, { service: { port: 8080, prot: 9090 } });
  return { report, generated: out };
});

check('Closing the service map rejects the misspelled key', () => {
  const report = vet(closedSchema, typo, options);
  assert.equal(report.verdict, 'invalid');
  assert.equal(report.findings[0].code, 'closed');
  assert.equal(report.findings[0].path, '$.service.prot');
  return report;
});

check('A missing defaulted field is valid and can be generated', () => {
  const report = vet(closedSchema, 'service: {}', options);
  const out = engine.generate(closedSchema + '\nservice: {}');
  assert.equal(report.verdict, 'valid');
  assert.deepEqual(out, { service: { port: 8080 } });
  return { report, generated: out };
});

check('A missing field without a default is incomplete', () => {
  const report = vet('service: close({port: integer})', 'service: {}', options);
  assert.equal(report.verdict, 'incomplete');
  return report;
});

check('An integer port still needs an application-specific range', () => {
  const input = 'service: {port: -1}';
  const loose = vet(closedSchema, input, options);
  const bounded = vet('service: close({port: *8080 | (integer & min(1) & max(65535))})', input, options);
  assert.equal(loose.verdict, 'valid');
  assert.equal(bounded.verdict, 'invalid');
  return { withoutRange: loose.verdict, withRange: bounded.verdict };
});

console.log(JSON.stringify({
  node: process.version,
  aontu: version,
  checks: results.length,
  passed: results.length,
  results
}, null, 2));
