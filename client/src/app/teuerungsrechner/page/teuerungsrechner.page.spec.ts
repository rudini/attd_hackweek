import { Observable, of } from 'rxjs';
import { cold } from 'jest-marbles';
import { TeuerungsrechnerPageComponent } from './teuerungsrechner.page';
import { BerechnungsParameterModel } from '../models';
import { teuerungsrechnerSelectors } from '../+state/reducer';
import { TeuerungsrechnerActions } from '../+state/actions';

export class MockStore {
    constructor(private selectorMap: { selector: any; value: Observable<any> }[] = []) {}

    public dispatch(action: any): void {
    }

    public select(selector: any): Observable<any> {
        const found = this.selectorMap.filter(x => x.selector === selector);
        if (found.length !== 0) {
            return found[0].value;
        }
        return cold('a', { a: {} });
    }
}

// 1. load data => dispatch LoadDataAction | OK
// 2. when inputs changes input as action on change => dispatch | OK
// 3. if ok? => berechnen => select | OK
// 3.1. calculate => dispatch (only if canBerechnen is true) | OK
// 3.1. calculate => not dispatch (because canBerechnen is false) | OK
// 3.2. model binding (resultat) => select | OK
describe('teuerungsrechner page', () => {
    it('Should load data on create', () => {
        // Arrange
        const store: any = new MockStore();
        const spy = jest.spyOn(store, 'dispatch');

        // Act
        new TeuerungsrechnerPageComponent(store);

        // Assert
        expect(spy).toHaveBeenCalledWith(TeuerungsrechnerActions.datenLaden(null));
    });

    it('Should trigger a change on input changes', () => {
        // Arrange
        const store: any = new MockStore();
        const spy = jest.spyOn(store, 'dispatch');
        const page = new TeuerungsrechnerPageComponent(store);

        // Act
        const parameters: Partial<BerechnungsParameterModel> = {};
        page.parameterChanged$.emit(parameters);

        // Assert
        expect(spy).toHaveBeenCalledWith(TeuerungsrechnerActions.berechnungsParameterChanged(parameters));
    });

    it('should update canBerechnen when the selector in the store has changed', () => {
        // Arrange
        const store: any = new MockStore([{ selector: teuerungsrechnerSelectors.getCanBerechnen, value: cold('a') }]);
        const page = new TeuerungsrechnerPageComponent(store);

        // Act and assert
        expect(page.canBerechnen$).toBeMarble('a');
    });

    it('should trigger calculate', () => {
        // Arrange
        const store: any = new MockStore([{ selector: teuerungsrechnerSelectors.getCanBerechnen, value: of(true) }]);
        const spy = jest.spyOn(store, 'dispatch');
        const page = new TeuerungsrechnerPageComponent(store);

        // Act
        page.berechnen$.emit();

        // Assert
        expect(spy).toHaveBeenCalledWith(TeuerungsrechnerActions.berechne(null));
    });

    it('should not trigger calculate when canBerechnen is false', () => {
        // Arrange
        const store: any = new MockStore([{ selector: teuerungsrechnerSelectors.getCanBerechnen, value: of(false) }]);
        const spy = jest.spyOn(store, 'dispatch');
        const page = new TeuerungsrechnerPageComponent(store);

        // Act
        page.berechnen$.emit();

        // Assert
        expect(spy).not.toHaveBeenCalledWith(TeuerungsrechnerActions.berechne(null));
    });

    it('should update resultat model when calculated', () => {
        // Arrange
        const store: any = new MockStore([
            { selector: teuerungsrechnerSelectors.getResult, value: cold('a', { a: {} }) },
        ]);
        const spy = jest.spyOn(store, 'dispatch');
        const page = new TeuerungsrechnerPageComponent(store);

        // Assert
        expect(page.result$).toBeObservable(cold('a', { a: {} }));
    });
});
