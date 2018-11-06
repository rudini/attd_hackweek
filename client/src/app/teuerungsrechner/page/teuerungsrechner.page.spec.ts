import { Store, createFeatureSelector, createSelector } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { ofType } from 'src/app/shared/redux-builder';
import { unionize } from 'unionize';
import { EventEmitter } from '@angular/core';
import { map, mapTo, withLatestFrom, filter } from 'rxjs/operators';
import { ContainerComponent } from 'src/app/shared/reactive-component';
import { cold } from 'jest-marbles';

export interface BerechnungsParameter {
    startdatum: string;
    zieldatum: string;
    indexbasis: string;
    betrag: number;
}

export type TeuerungsrechnerStore = {
    canBerechnen: boolean;
    result: any;
};

// move to test libs
const mockActions = <T>(record: T) => unionize(record, 'type', 'payload');

export const teuerungsrechnerActionsRecord = {
    datenLaden: ofType<null>(),
    berechnungsParameterChanged: ofType<Partial<BerechnungsParameter>>(),
    berechne: ofType<null>(),
};

const TeuerungsrechnerActions = mockActions(teuerungsrechnerActionsRecord);

export class MockStore {
    constructor(private selectorMap: { selector: any; value: Observable<any> }[] = []) {}

    public dispatch(action: any): void {
        console.log('dispatching from the mock store!');
    }

    public select(selector: any): Observable<any> {
        const found = this.selectorMap.filter(x => x.selector === selector);
        if (found.length !== 0) {
            return found[0].value;
        }
        return cold('a', { a: {} });
    }
}

export const getTeuerungsrechnerState = createFeatureSelector<TeuerungsrechnerStore>('teuerungsrechner');
export const teuerungsrechnerSelectors = {
    getCanBerechnen: createSelector(getTeuerungsrechnerState, state => state.canBerechnen),
    getResult: createSelector(getTeuerungsrechnerState, state => state.result),
};

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
        const parameters: Partial<BerechnungsParameter> = {};
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

// @Component({
//     template: ''
// })
export class TeuerungsrechnerPageComponent extends ContainerComponent {
    parameterChanged$ = new EventEmitter<Partial<BerechnungsParameter>>();
    berechnen$ = new EventEmitter();

    canBerechnen$: Observable<boolean>;
    result$: Observable<any>;

    constructor(private store: Store<any>) {
        super(store.dispatch.bind(store));

        this.store.dispatch(TeuerungsrechnerActions.datenLaden(null));

        this.canBerechnen$ = this.store.select(teuerungsrechnerSelectors.getCanBerechnen);
        this.result$ = this.store.select(teuerungsrechnerSelectors.getResult);

        this.dispatch(
            this.parameterChanged$.pipe(
                map(parameters => TeuerungsrechnerActions.berechnungsParameterChanged(parameters))
            ),
            this.berechnen$.pipe(
                withLatestFrom(this.canBerechnen$),
                filter(([_, canBerechnen]) => canBerechnen),
                mapTo(TeuerungsrechnerActions.berechne(null))
            )
        );
    }
}
