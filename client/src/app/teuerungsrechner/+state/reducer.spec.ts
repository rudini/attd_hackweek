import { reduxBuilder } from '@shared/redux-builder';
import { teuerungsrechnerActionsRecord, TeuerungsrechnerActions } from './actions';
import { TeuerungsrechnerStore } from './reducer';
import { initial, loading, success, RemoteDataError, failure } from '@shared/remote-data';
import { none, some } from 'fp-ts/lib/Option';
import { TeuerungsrechnerdatenDto } from '@teuerungsrechner/contracts';

// reducer impl
const initialState: TeuerungsrechnerStore = { datenLaden: initial, result: <any>{}, canBerechnen: false };

const built = reduxBuilder<TeuerungsrechnerStore>()
    .declareInitialState(initialState)
    .declareActions(teuerungsrechnerActionsRecord)
    .declareReducer(state => ({
        applyDatenLaden: payload => ({ ...state, datenLaden: payload }),
    }));

export function teuerungsrechnerReducer(state: any, action: any) {
    return built.reducer(state, action);
}
// reducer impl end

// Initialize data for datastore | OK
// Daten geladen =>
// -- loading | OK
// -- data | OK
// -- error | OK
// Parameter updates => set canBerechnen
// Berechnen when all parameters are set
describe('teuerungsrechner reducer tests', () => {
    describe('on load daten - loading', () => {
        const ladenLoadingAction = TeuerungsrechnerActions.applyDatenLaden(loading);
        it('it should set the loading state', () => {
            expect(teuerungsrechnerReducer(undefined, ladenLoadingAction).datenLaden.loading).toEqual(true);
        });

        it('it should set the error to none', () => {
            expect(teuerungsrechnerReducer(undefined, ladenLoadingAction).datenLaden.error).toEqual(none);
        });

        it('it should set the data to none', () => {
            expect(teuerungsrechnerReducer(undefined, ladenLoadingAction).datenLaden.data).toEqual(none);
        });
    });

    describe('on load daten - success', () => {
        const data: TeuerungsrechnerdatenDto = {
            timeDimension: { id: 1, month: 1, year: 2016, name: 'Januar 2016' },
            indexDimension: { id: 1, month: 5, year: 1914, name: 'Mai 1914' },
            facts: { timeDim: 1, indexDim: 1, indexValue: 1017.1 },
        };
        const ladenSuccessAction = TeuerungsrechnerActions.applyDatenLaden(success(data));
        it('it should set the loading state', () => {
            expect(teuerungsrechnerReducer(undefined, ladenSuccessAction).datenLaden.loading).toEqual(false);
        });

        it('it should set the error to none', () => {
            expect(teuerungsrechnerReducer(undefined, ladenSuccessAction).datenLaden.error).toEqual(none);
        });

        it('it should set the data to none', () => {
            expect(teuerungsrechnerReducer(undefined, ladenSuccessAction).datenLaden.data).toEqual(some(data));
        });
    });

    describe('on load daten - error', () => {
        const error = RemoteDataError.APIErrorResponse({
            apiErrorResponse: { status: 500, statusText: 'Internal server error', error: null },
        });
        const ladenErrorAction = TeuerungsrechnerActions.applyDatenLaden(failure(error));
        it('it should set the loading state', () => {
            expect(teuerungsrechnerReducer(undefined, ladenErrorAction).datenLaden.loading).toEqual(false);
        });

        it('it should set the error to none', () => {
            expect(teuerungsrechnerReducer(undefined, ladenErrorAction).datenLaden.error).toEqual(some(error));
        });

        it('it should set the data to none', () => {
            expect(teuerungsrechnerReducer(undefined, ladenErrorAction).datenLaden.data).toEqual(none);
        });
    });
});
