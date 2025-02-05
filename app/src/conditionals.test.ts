/*
 * Copyright 2021, 2022 Macquarie University
 *
 * Licensed under the Apache License Version 2.0 (the, "License");
 * you may not use, this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND either express or implied.
 * See, the License, for the specific language governing permissions and
 * limitations under the License.
 *
 * Filename: branchingLogic.test.tsx
 */

// eslint-disable-next-line n/no-unpublished-import
import {expect, it, describe} from 'vitest';
import {
  compileExpression,
  getDependantFields,
  isStringArray,
} from './conditionals';

describe('get dependant fields', () => {
  it('finds dependant fields in a nested expression', () => {
    const expr = {
      operator: 'and',
      conditions: [
        {
          operator: 'or',
          conditions: [
            {operator: 'equal', field: 'x', value: 'A'},
            {operator: 'equal', field: 'x', value: 'B'},
          ],
        },
        {
          operator: 'or',
          conditions: [
            {operator: 'less', field: 'y', value: 10},
            {operator: 'greater', field: 'y', value: 100},
            {operator: 'contains', field: 'z', value: 'test'},
          ],
        },
      ],
    };
    const fields = getDependantFields(expr);
    expect(fields).toEqual(new Set(['x', 'y', 'z']));
  });
});

describe('compiling expressions', () => {
  it('compiles undefined to a fn returning true', () => {
    const fn = compileExpression(undefined);
    expect(fn({foo: 12})).toBe(true);
  });

  it('compiles an equal expression', () => {
    const expr = {
      operator: 'equal',
      field: 'surveyArea',
      value: 'Zone Alpha; ',
    };
    const fn = compileExpression(expr);
    expect(fn({surveyArea: 'Zone Alpha; '})).toBe(true);
    expect(fn({surveyArea: 'Zone Beta; '})).toBe(false);
  });

  it('compiles a not-equal expression', () => {
    const expr = {
      operator: 'not-equal',
      field: 'surveyArea',
      value: 'Zone Alpha; ',
    };
    const fn = compileExpression(expr);
    expect(fn({surveyArea: 'Zone Alpha; '})).toBe(false);
    expect(fn({surveyArea: 'Zone Beta; '})).toBe(true);
  });

  it('compiles a regex expression', () => {
    const expr = {
      operator: 'regex',
      field: 'surveyArea',
      value: 'A.*;',
    };
    const fn = compileExpression(expr);
    expect(fn({surveyArea: 'Zone Alpha; '})).toBe(true);
    expect(fn({surveyArea: 'Axminster; '})).toBe(true);
    expect(fn({surveyArea: 'Zone Beta; '})).toBe(false);
  });

  it('compiles an greater expression', () => {
    const expr = {
      operator: 'greater',
      field: 'price',
      value: 100,
    };
    const fn = compileExpression(expr);
    expect(fn({price: 200})).toBe(true);
    expect(fn({price: 50})).toBe(false);
  });

  it('compiles an greater-equal expression', () => {
    const expr = {
      operator: 'greater-equal',
      field: 'price',
      value: 100,
    };
    const fn = compileExpression(expr);
    expect(fn({price: 100})).toBe(true);
    expect(fn({price: 200})).toBe(true);
    expect(fn({price: 50})).toBe(false);
  });

  it('compiles a less expression', () => {
    const expr = {
      operator: 'less',
      field: 'price',
      value: 100,
    };
    const fn = compileExpression(expr);
    expect(fn({price: 200})).toBe(false);
    expect(fn({price: 50})).toBe(true);
  });

  it('compiles an less-equal expression', () => {
    const expr = {
      operator: 'less-equal',
      field: 'price',
      value: 100,
    };
    const fn = compileExpression(expr);
    expect(fn({price: 100})).toBe(true);
    expect(fn({price: 200})).toBe(false);
    expect(fn({price: 50})).toBe(true);
  });

  it('compiles an or expression', () => {
    const expr = {
      operator: 'or',
      conditions: [
        {operator: 'equal', field: 'surveyArea', value: 'Zone Alpha; '},
        {operator: 'greater', field: 'price', value: 100},
      ],
    };
    const fn = compileExpression(expr);
    expect(fn({surveyArea: 'Zone Alpha; ', price: 10})).toBe(true);
    expect(fn({surveyArea: 'Zone Beta; ', price: 200})).toBe(true);
    expect(fn({surveyArea: 'Zone Alpha; ', price: 200})).toBe(true);
    expect(fn({surveyArea: 'Zone Beta; ', price: 10})).toBe(false);
  });

  it('compiles an and expression', () => {
    const expr = {
      operator: 'and',
      conditions: [
        {operator: 'equal', field: 'surveyArea', value: 'Zone Alpha; '},
        {operator: 'less', field: 'price', value: 100},
      ],
    };
    const fn = compileExpression(expr);
    expect(fn({surveyArea: 'Zone Alpha; ', price: 10})).toBe(true);
    expect(fn({surveyArea: 'Zone Beta; ', price: 200})).toBe(false);
    expect(fn({surveyArea: 'Zone Alpha; ', price: 200})).toBe(false);
    expect(fn({surveyArea: 'Zone Beta; ', price: 10})).toBe(false);
  });

  it('compiles a complex embedded expression', () => {
    // (x=A or x=B) and (y<10 or y>100)
    const expr = {
      operator: 'and',
      conditions: [
        {
          operator: 'or',
          conditions: [
            {operator: 'equal', field: 'x', value: 'A'},
            {operator: 'equal', field: 'x', value: 'B'},
          ],
        },
        {
          operator: 'or',
          conditions: [
            {operator: 'less', field: 'y', value: 10},
            {operator: 'greater', field: 'y', value: 100},
          ],
        },
      ],
    };
    const fn = compileExpression(expr);
    expect(fn({x: 'A', y: 200})).toBe(true);
    expect(fn({x: 'B', y: 200})).toBe(true);
    expect(fn({x: 'A', y: 2})).toBe(true);
    expect(fn({x: 'B', y: 2})).toBe(true);
    expect(fn({x: 'C', y: 200})).toBe(false);
    expect(fn({x: 'A', y: 50})).toBe(false);
  });

  it('throws an error for an invalid expression', () => {
    const expr = {
      operator: 'unknown-operator',
      field: 'price',
      value: 100,
    };
    expect(() => compileExpression(expr)).toThrowError(
      /^Unknown operator unknown-operator in conditional expression$/
    );
  });

  it('behaves when a value is not present', () => {
    // when the values passed in are missing the target value
    // we just return false
    const expr = {
      operator: 'equal',
      field: 'surveyArea',
      value: 'Zone Alpha; ',
    };
    const fn = compileExpression(expr);
    expect(fn({price: 100})).toBe(false);
  });

  it('not-equal is true when a value is not present', () => {
    // when the values passed in are missing the target value
    // we return true for the not-equal comparator
    const expr = {
      operator: 'not-equal',
      field: 'surveyArea',
      value: 'Zone Alpha; ',
    };
    const fn = compileExpression(expr);
    expect(fn({price: 100})).toBe(true);
  });

  it('compiles a contains expression', () => {
    const expr = {
      operator: 'contains',
      field: 'tags',
      value: 'urgent',
    };
    const fn = compileExpression(expr);
    expect(fn({tags: ['urgent', 'important']})).toBe(true);
    expect(fn({tags: ['important']})).toBe(false);
    expect(fn({tags: []})).toBe(false);
    expect(fn({other: ['urgent']})).toBe(false);
  });

  it('compiles a does-not-contain expression', () => {
    const expr = {
      operator: 'does-not-contain',
      field: 'tags',
      value: 'urgent',
    };
    const fn = compileExpression(expr);
    expect(fn({tags: ['urgent', 'important']})).toBe(false);
    expect(fn({tags: ['important']})).toBe(true);
    expect(fn({tags: []})).toBe(true);
    expect(fn({other: ['urgent']})).toBe(false);
  });

  it('compiles a contains-regex expression', () => {
    const expr = {
      operator: 'contains-regex',
      field: 'tags',
      value: '^urg.*$',
    };
    const fn = compileExpression(expr);
    expect(fn({tags: ['urgent', 'important']})).toBe(true);
    expect(fn({tags: ['urge']})).toBe(true);
    expect(fn({tags: ['important']})).toBe(false);
    expect(fn({other: ['urgent']})).toBe(false);
  });

  it('compiles a does-not-contain-regex expression', () => {
    const expr = {
      operator: 'does-not-contain-regex',
      field: 'tags',
      value: '^urg.*$',
    };
    const fn = compileExpression(expr);
    expect(fn({tags: ['urgent', 'important']})).toBe(false);
    expect(fn({tags: ['important']})).toBe(true);
    expect(fn({tags: []})).toBe(true);
    expect(fn({other: ['urgent']})).toBe(false);
  });

  it('handles whitespace in contains expression', () => {
    const expr = {
      operator: 'contains',
      field: 'tags',
      value: 'urgent',
    };
    const fn = compileExpression(expr);
    // Can strip white space from search param AND
    expect(fn({tags: ['urgent', 'important']})).toBe(true);
    // Can strip whitespace from the list
    expect(fn({tags: ['urgent ']})).toBe(true);
  });

  it('handles whitespace in does-not-contain expression', () => {
    const expr = {
      operator: 'does-not-contain',
      field: 'tags',
      value: 'urgent ',
    };
    const fn = compileExpression(expr);
    expect(fn({tags: ['urgent', 'important']})).toBe(false);
    expect(fn({tags: ['urgent ']})).toBe(false);
  });

  it('handles whitespace in contains-regex expression', () => {
    const expr = {
      operator: 'contains-regex',
      field: 'tags',
      value: '^urgent\\s+$',
    };
    const fn = compileExpression(expr);
    // Regex explicitly expecting whitespace should be accurate - no stripping here
    expect(fn({tags: ['urgent', 'important']})).toBe(false);
    expect(fn({tags: ['urgent ']})).toBe(true);
  });

  it('handles whitespace in does-not-contain-regex expression', () => {
    const expr = {
      operator: 'does-not-contain-regex',
      field: 'tags',
      value: '^urgent\\s+$',
    };
    const fn = compileExpression(expr);
    // Regex explicitly expecting whitespace should be accurate - no stripping here
    expect(fn({tags: ['urgent', 'important']})).toBe(true);
    expect(fn({tags: ['urgent ']})).toBe(false);
  });

  it('checks that string arrays are valid', () => {
    const shouldBeArrays = [['this', 'is'], [], ['single'], ['']];
    const shouldNotBeArrays = [
      false,
      'string',
      null,
      undefined,
      1,
      ['valid', null],
      [1],
      ['valid', undefined],
      [1, ''],
    ];

    for (const should of shouldBeArrays) {
      const res = isStringArray(should);
      expect(res).to.be.true;
    }

    for (const shouldNot of shouldNotBeArrays) {
      const res = isStringArray(shouldNot);
      expect(res).to.be.false;
    }
  });
});
