const { dummy } = require('../utils/list_helper');

test('dummy returns one', () => {
    expect(dummy([])).toBe(1);
});