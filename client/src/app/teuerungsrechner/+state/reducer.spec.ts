import { reduxBuilder } from '@shared/redux-builder';
import { teuerungsrechnerActionsRecord, TeuerungsrechnerActions } from './actions';
import { TeuerungsrechnerStore } from './reducer';
import { initial, loading, success, RemoteDataError, failure } from '@shared/remote-data';
import * as option from 'fp-ts/lib/Option';
import { TeuerungsrechnerdatenDto } from '@teuerungsrechner/contracts';

// reducer impl
const initialState: TeuerungsrechnerStore = {
    datenLaden: initial,
    result: <any>{},
    canBerechnen: false,
    parameters: {
        startdatum: option.none,
        zieldatum: option.none,
        betrag: option.none,
        indexbasis: option.none
    }
};

const built = reduxBuilder<TeuerungsrechnerStore>()
    .declareInitialState(initialState)
    .declareActions(teuerungsrechnerActionsRecord)
    .declareReducer(state => ({
        applyDatenLaden: payload => ({ ...state, datenLaden: payload }),
        applyBerechnungsParameterChanged: payload => ({
            ...state,
            parameters: {
                startdatum: option.fromNullable(payload.startdatum),
                zieldatum: option.fromNullable(payload.zieldatum),
                betrag: option.fromNullable(payload.betrag),
                indexbasis: option.fromNullable(payload.indexbasis)
            }
        }),
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
            expect(teuerungsrechnerReducer(undefined, ladenLoadingAction).datenLaden.error).toEqual(option.none);
        });

        it('it should set the data to none', () => {
            expect(teuerungsrechnerReducer(undefined, ladenLoadingAction).datenLaden.data).toEqual(option.none);
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
            expect(teuerungsrechnerReducer(undefined, ladenSuccessAction).datenLaden.error).toEqual(option.none);
        });

        it('it should set the data to none', () => {
            expect(teuerungsrechnerReducer(undefined, ladenSuccessAction).datenLaden.data).toEqual(option.some(data));
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
            expect(teuerungsrechnerReducer(undefined, ladenErrorAction).datenLaden.error).toEqual(option.some(error));
        });

        it('it should set the data to none', () => {
            expect(teuerungsrechnerReducer(undefined, ladenErrorAction).datenLaden.data).toEqual(option.none);
        });
    });

    describe('on set parameters', () => {

        const startdatumParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({ startdatum: 'Januar 2018' });
        const zieldatumParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({ zieldatum: 'Januar 2018' });
        const betragParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({ betrag: 70000.00 });
        const indexbasisParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({ indexbasis: 'Dezember 2015' })

        it('it should set startdatum parameter', () => {
            expect(teuerungsrechnerReducer(undefined, startdatumParameterChangedAction)
                .parameters.startdatum).toEqual(option.some('Januar 2018'));
        });

        it('it should set zieldatum parameter', () => {
            expect(teuerungsrechnerReducer(undefined, zieldatumParameterChangedAction)
                .parameters.zieldatum).toEqual(option.some('Januar 2018'));
        });

        it('it should set betrag parameter', () => {
            expect(teuerungsrechnerReducer(undefined, betragParameterChangedAction)
                .parameters.betrag).toEqual(option.some(70000.00));
        });

        it('it should set indexbasis parameter', () => {
            expect(teuerungsrechnerReducer(undefined, indexbasisParameterChangedAction)
                .parameters.indexbasis).toEqual(option.some('Dezember 2015'));
        });

        it('it should set the canBerechnen when all required parameters set', () => {

        });
    });
});
