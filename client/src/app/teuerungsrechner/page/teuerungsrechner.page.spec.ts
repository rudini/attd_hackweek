import { Store, createFeatureSelector, createSelector } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ofType } from 'src/app/shared/redux-builder';
import { unionize } from 'unionize';
import { EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { ContainerComponent } from 'src/app/shared/reactive-component';
import { ColdObservable } from 'jest-marbles/typings/src/rxjs/cold-observable';
import { cold } from 'jest-marbles';

export interface BerechnungsParameter {
    startdatum: string;
    zieldatum: string;
    indexbasis: string;
    betrag: number;
}

export type TeuerungsrechnerStore = {
    canBerechnen: boolean;
};

// move to test libs
var mockActions = <T>(record: T) => unionize(record, 'type', 'payload');

export const teuerungsrechnerActionsRecord = {
    loadData: ofType<null>(),
    berechnungsParameterChanged: ofType<Partial<BerechnungsParameter>>(),
};

const TeuerungsrechnerActions = mockActions(teuerungsrechnerActionsRecord);

export class MockStore {
    constructor(private onSelect?: ColdObservable) {
    }

    public dispatch(action: any): void {
        console.log('dispatching from the mock store!');
    }

    public select(selector: ()=> any): ColdObservable {
        console.log('selecting from the mock store!');
        return this.onSelect ? this.onSelect : cold('a', {a: {}});
    }
}

export const getTeuerungsrechnerState = createFeatureSelector<TeuerungsrechnerStore>('teuerungsrechner');
export const teuerungsrechnerSelectors = {
    getCanBerechnen: createSelector(getTeuerungsrechnerState, state => state.canBerechnen),
};

// 1. load data => dispatch LoadDataAction | OK
// 2. when inputs changes input as action on change => dispatch | OK
// 3. if ok? => berechnen => select | OK
// 3.1. calculate => dispatch (only if canBerechnen is true) !! negative test
// 3.2. model binding (resultat) => select
describe('teuerungsrechner page', () => {
    it('Should load data on create', () => {
        // Arrange
        var store: any = new MockStore();
        var spy = jest.spyOn(store, 'dispatch');

        // Act
        new TeuerungsrechnerPageComponent(store);

        // Assert
        expect(spy).toHaveBeenCalledWith(TeuerungsrechnerActions.loadData(null));
    });

    it('Should trigger a change on input changes', () => {
        // Arrange
        var store: any = new MockStore();
        var spy = jest.spyOn(store, 'dispatch');
        var page = new TeuerungsrechnerPageComponent(store);

        // Act
        const parameters: Partial<BerechnungsParameter> = {};
        page.parameterChanged$.emit(parameters);

        // Assert
        expect(spy).toHaveBeenCalledWith(TeuerungsrechnerActions.berechnungsParameterChanged(parameters));
    });

    it('should update canBerechnen when the selector in the store has changed', () => {
        
        // Arrange
        var store: any = new MockStore(cold('a'));
        var page = new TeuerungsrechnerPageComponent(store);

        // Act
        expect(page.canBerechnen$).toBeMarble('a');
    });
});

// @Component({
//     template: ''
// })
export class TeuerungsrechnerPageComponent extends ContainerComponent {
    parameterChanged$ = new EventEmitter<Partial<BerechnungsParameter>>();
    canBerechnen$: Observable<boolean>;

    constructor(private store: Store<any>) {
        super(store.dispatch.bind(store));

        this.store.dispatch(TeuerungsrechnerActions.loadData(null));

        this.dispatch(
            this.parameterChanged$.pipe(
                map(parameters => TeuerungsrechnerActions.berechnungsParameterChanged(parameters))
            )
        );

        this.canBerechnen$ = this.store.select(teuerungsrechnerSelectors.getCanBerechnen);
    }
}
