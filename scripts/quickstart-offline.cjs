'use strict';
const assert = require('node:assert/strict');
let networkCalls = 0;
globalThis.fetch = async () => {
  networkCalls += 1;
  throw new Error('The offline quickstart must not call the network.');
};
const { FrankfurterSDK } = require('../ts/dist/FrankfurterSDK.js');

async function main() {
  const empty = FrankfurterSDK.test({ entity: { currency: {} } });
  assert.deepEqual(await empty.Currency().list(), []);
  const client = FrankfurterSDK.test({
    entity: { currency: { BRL: { id: 'BRL', code: 'BRL' } } },
  });
  const currencies = await client.Currency().list();
  assert.equal(currencies.length, 1);
  assert.equal(currencies[0].data().id, 'BRL');
  assert.equal(currencies[0].data().code, 'BRL');
  assert.equal(networkCalls, 0);
  console.log('PASS: empty mock, seeded BRL record and zero network calls.');
}
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
