import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { ofType } from 'src/app/shared/redux-builder';
import { unionize } from 'unionize';

type TeuerungsrechnerStore = {
}

// move to test libs
var mockActions = <T>(record: T) => 
    unionize(record, 'type', 'payload');

export const teuerungsrechnerActionsRecord = {
    loadData: ofType<null>()
};

const loadDataAction = mockActions(teuerungsrechnerActionsRecord).loadData;

export class MockStore {
    public dispatch(obj): void {
        console.log('dispatching from the mock store!');
    }

    public select(obj): Observable<{}> {
        console.log('selecting from the mock store!');
        return of({});
    }
}

// 1. load data => dispatch LoadDataAction => OK
// 2. when inputs changes input as action on change => dispatch
// 3. if ok? => berechnen (select)
// 4. dispatch calc 
// 5. model
describe('teuerungsrechner page', () => {

    it('Should load data on create', () => {

        // Arrange
        var store: any = new MockStore();
        var spy = jest.spyOn(store, 'dispatch');

        // Act
        new TeuerungsrechnerPageComponent(store);

        // Assert
        expect(spy).toHaveBeenCalledWith(loadDataAction(null));
    });
});

// @Component({
//     template: ''
// })
export class TeuerungsrechnerPageComponent {
    constructor(private store: Store<any>) {
        this.store.dispatch(loadDataAction(null));
    }
}




