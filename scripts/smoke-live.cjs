const assert = require('node:assert/strict');
const { FrankfurterSDK } = require('../ts/dist/FrankfurterSDK.js');

async function main() {
  const client = new FrankfurterSDK();
  const match = { base: 'EUR', quote: 'BRL', date: '2026-10-01' };
  const rate = (await client.Rate().load(match)).data();
  assert.equal(rate.base, 'EUR');
  assert.equal(rate.quote, 'BRL');
  assert.equal(rate.date, match.date);
  assert.ok(Number.isFinite(rate.rate) && rate.rate > 0);

  const list = await client.Rate().list(match);
  assert.equal(list.length, 1);
  assert.equal(list[0].data().quote, 'BRL');
  assert.equal(list[0].data().rate, rate.rate);

  const currencies = await client.Currency().list();
  assert.ok(currencies.length > 0);

  const invalid = await client.direct({
    method: 'GET', path: '/rate/{base}/{quote}',
    params: { base: 'INVALID', quote: 'BRL' },
  });
  assert.equal(invalid.ok, false);
  assert.ok([400, 404, 422].includes(invalid.status));
  console.log(JSON.stringify({ rate, listCount: list.length,
    currencyCount: currencies.length, invalidStatus: invalid.status }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
