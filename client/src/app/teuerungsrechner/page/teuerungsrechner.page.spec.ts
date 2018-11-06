import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { ofType } from 'src/app/shared/redux-builder';
import { unionize } from 'unionize';
import { EventEmitter } from '@angular/core';
import { takeUntil, map } from 'rxjs/operators';
import { ContainerComponent } from 'src/app/shared/reactive-component';

export interface BerechnungsParameter {
    startdatum: string;
    zieldatum: string;
    indexbasis: string;
    betrag: number;
}

export type TeuerungsrechnerStore = {};

// move to test libs
var mockActions = <T>(record: T) => unionize(record, 'type', 'payload');

export const teuerungsrechnerActionsRecord = {
    loadData: ofType<null>(),
    berechnungsParameterChanged: ofType<Partial<BerechnungsParameter>>(),
};

const TeuerungsrechnerActions = mockActions(teuerungsrechnerActionsRecord);

export class MockStore {
    public dispatch(obj): void {
        console.log('dispatching from the mock store!');
    }

    public select(obj): Observable<{}> {
        console.log('selecting from the mock store!');
        return of({});
    }
}

// 1. load data => dispatch LoadDataAction | OK
// 2. when inputs changes input as action on change => dispatch | OK
// 3. if ok? => berechnen => select
// 3.1. calculate => dispatch
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
});

// @Component({
//     template: ''
// })
export class TeuerungsrechnerPageComponent extends ContainerComponent {
    parameterChanged$ = new EventEmitter<Partial<BerechnungsParameter>>();

    constructor(private store: Store<any>) {
        super(store.dispatch.bind(store));

        this.store.dispatch(TeuerungsrechnerActions.loadData(null));

        this.dispatch(
            this.parameterChanged$.pipe(
                map(parameters => TeuerungsrechnerActions.berechnungsParameterChanged(parameters))
            )
        );
    }
}
