import { cold, hot, time } from 'jest-marbles';
import { concat } from 'rxjs/operators';

describe('marbles example', () => {

    it('Should concatenate two cold observables into single cold observable', () => {
        const a = cold('-a-|');
        const b = cold('-b-|');
        const expected = '-a--b-|';
        expect(a.pipe(concat(b))).toBeMarble(expected);
    });
});
