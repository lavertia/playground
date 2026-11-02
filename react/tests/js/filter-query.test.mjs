import test from 'node:test';
import assert from 'node:assert/strict';

import {
    countRules, createRule, evaluateQuery, validateQuery,
} from '../../resources/js/components/lavertia/filter-query.ts';

const fields = [
    { key: 'name', label: 'Name', kind: 'text' },
    { key: 'price', label: 'Price', kind: 'number' },
    { key: 'featured', label: 'Featured', kind: 'boolean' },
    { key: 'published_at', label: 'Publishing date', kind: 'date' },
];
const data = [
    { name: 'Cedar Candle', price: 120, featured: false, published_at: '2026-10-29' },
    { name: 'Artisan Candle', price: 50, featured: false, published_at: '2026-11-01' },
    { name: 'Leather Wallet', price: 180, featured: true, published_at: '2026-11-02' },
    { name: 'Desk', price: 20, featured: false, published_at: null },
];
const rule = (id, field, operator, value = '', valueTo = '') =>
    ({ type: 'rule', id, field, operator, value, valueTo });
const group = (id, junction, ...children) => ({ type: 'group', id, junction, children });

test('nested AND and OR groups retain boolean precedence', () => {
    const q = group('root', 'or',
        group('g1', 'and', rule('r1', 'name', 'contains', 'candle'), rule('r2', 'price', 'gt', '100')),
        group('g2', 'and', rule('r3', 'featured', 'is_true'), rule('r4', 'price', 'lt', '200')),
    );
    assert.deepEqual(validateQuery(q, fields), []);
    assert.deepEqual(data.filter(item => evaluateQuery(item, q, fields)).map(item => item.name),
        ['Cedar Candle', 'Leather Wallet']);
    assert.equal(countRules(q), 4);
});

test('number ranges, date ranges and nullable boolean fields', () => {
    const q = group('root', 'and',
        rule('range', 'price', 'between', '50', '180'),
        rule('date', 'published_at', 'after', '2026-10-30'),
    );
    assert.deepEqual(data.filter(item => evaluateQuery(item, q, fields)).map(item => item.name),
        ['Artisan Candle', 'Leather Wallet']);
    assert.equal(data.filter(item => evaluateQuery(item, group('g', 'and', rule('e', 'published_at', 'is_empty')), fields)).length, 1);
    assert.equal(data.filter(item => evaluateQuery(item, group('g', 'and', rule('f', 'featured', 'is_false')), fields)).length, 3);
});

test('invalid conditions never become wildcard matches', () => {
    const q = group('root', 'and', rule('bad', '__proto__', 'contains', 'foo'));
    assert.ok(validateQuery(q, fields).length);
    assert.equal(evaluateQuery(data[0], q, fields), false);
    assert.ok(validateQuery(group('g', 'and', rule('r', 'price', 'gt', 'not-a-number')), fields).length);
    assert.ok(validateQuery(group('g', 'and', rule('r', 'price', 'between', '10', '')), fields).length);
    assert.ok(validateQuery(group('g', 'and', rule('r', 'published_at', 'after', '2026-02-30')), fields).length);
});

test('field/operator allowlists reject impossible combinations', () => {
    const q = group('root', 'and', rule('r', 'featured', 'contains', 'true'));
    assert.ok(validateQuery(q, fields).length);
    assert.equal(evaluateQuery(data[2], q, fields), false);
});

test('an empty root matches everything, case insensitive text and default operators', () => {
    assert.equal(data.filter(item => evaluateQuery(item, group('g', 'and'), fields)).length, 4);
    assert.equal(data.filter(item => evaluateQuery(item, group('g', 'and', rule('r', 'name', 'contains', 'CANDLE')), fields)).length, 2);
    assert.equal(createRule(fields[0], 'id').operator, 'contains');
});
