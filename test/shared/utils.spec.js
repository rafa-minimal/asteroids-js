const assert = require('assert');
const utils = require('../../src/shared/utils');

describe('utils.permutations', () => {
    let testCases = [
        {in: [], out: []},
        {in: [1], out: [[1]]},
        {in: [1, 2], out: [[1, 2], [2, 1]]},
        {in: [1, 2, 3], out: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]},
    ];

    testCases.forEach(tc => {
        it(`${tc.in} -> ${tc.out}`, () => {
            assert.deepStrictEqual(utils.permutations(tc.in), tc.out)
        });
    });
});