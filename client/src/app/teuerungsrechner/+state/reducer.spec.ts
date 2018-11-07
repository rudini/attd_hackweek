import { reduxBuilder } from '@shared/redux-builder';
import { teuerungsrechnerActionsRecord, TeuerungsrechnerActions } from './actions';
import { TeuerungsrechnerStore, Parameters } from './reducer';
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
        indexbasis: option.none,
    },
};

function canBerechnen(parameters: Parameters) {
    return Object.keys(parameters).every((k: keyof typeof parameters) => {
        return !!(parameters[k] as option.Option<any>).getOrElse('')
    });
}

function berechneResultat(state: TeuerungsrechnerStore) {
    return state.result;
}

const built = reduxBuilder<TeuerungsrechnerStore>()
    .declareInitialState(initialState)
    .declareActions(teuerungsrechnerActionsRecord)
    .declareReducer(state => ({
        applyDatenLaden: payload => ({ ...state, datenLaden: payload }),
        applyBerechnungsParameterChanged: payload => {
            const parameters: Parameters = {
                startdatum: option.fromNullable(payload.startdatum),
                zieldatum: option.fromNullable(payload.zieldatum),
                betrag: option.fromNullable(payload.betrag),
                indexbasis: option.fromNullable(payload.indexbasis),
            };
            return {
                ...state,
                parameters,
                canBerechnen: canBerechnen(parameters),
            };
        },
        applyBerechne: _ => {
            return !canBerechnen ? state : { ...state, result: berechneResultat(state) };
        }
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
// Parameter updates => set canBerechnen when all parameters are valid | OK
// Parameter updates => do not set canBerechnen if some parameter is invalid | OK
// Berechnen when can berechnen
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
            timeDimension: [{ id: 1, month: 1, year: 2016, name: 'Januar 2016' }],
            indexDimension: [{ id: 1, month: 5, year: 1914, name: 'Mai 1914' }],
            facts: [{ timeDim: 1, indexDim: 1, indexValue: 1017.1 }],
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
        const startdatumParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({
            startdatum: 'Januar 2018',
        });
        const zieldatumParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({
            zieldatum: 'Januar 2018',
        });
        const betragParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({
            betrag: 70000.0,
        });
        const indexbasisParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({
            indexbasis: 'Dezember 2015',
        });

        it('it should set startdatum parameter', () => {
            expect(teuerungsrechnerReducer(undefined, startdatumParameterChangedAction).parameters.startdatum).toEqual(
                option.some('Januar 2018')
            );
        });

        it('it should set zieldatum parameter', () => {
            expect(teuerungsrechnerReducer(undefined, zieldatumParameterChangedAction).parameters.zieldatum).toEqual(
                option.some('Januar 2018')
            );
        });

        it('it should set betrag parameter', () => {
            expect(teuerungsrechnerReducer(undefined, betragParameterChangedAction).parameters.betrag).toEqual(
                option.some(70000.0)
            );
        });

        it('it should set indexbasis parameter', () => {
            expect(teuerungsrechnerReducer(undefined, indexbasisParameterChangedAction).parameters.indexbasis).toEqual(
                option.some('Dezember 2015')
            );
        });

        it('it should set the canBerechnen when all required parameters set', () => {
            const setAllParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({
                betrag: 70000.0,
                startdatum: 'Januar 2017',
                zieldatum: 'Januar 2018',
                indexbasis: 'Dezember 2015',
            });

            expect(teuerungsrechnerReducer(undefined, setAllParameterChangedAction).canBerechnen).toEqual(true);
        });

        it('it should set the canBerechnen when some parameters are not set', () => {
            const setAllParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({
                betrag: 70000.0,
                startdatum: null,
                zieldatum: 'Januar 2018',
                indexbasis: 'Dezember 2015',
            });

            expect(teuerungsrechnerReducer(undefined, setAllParameterChangedAction).canBerechnen).toEqual(false);
        });

        it('it should set the canBerechnen when some parameters are empty string', () => {
            const setAllParameterChangedAction = TeuerungsrechnerActions.applyBerechnungsParameterChanged({
                betrag: 70000.0,
                startdatum: '',
                zieldatum: 'Januar 2018',
                indexbasis: 'Dezember 2015',
            });

            expect(teuerungsrechnerReducer(undefined, setAllParameterChangedAction).canBerechnen).toEqual(false);
        });
    });

    describe('on berechnen', () => {
        it('it should set berechungsresultat when canBerechnen is true', () => {
            const applyBerechnen = TeuerungsrechnerActions.applyBerechne(null);
            const allParametersSetPrecondition: TeuerungsrechnerStore = {
                datenLaden: success(berchnungsdaten),
                result: <any>{},
                canBerechnen: true,
                parameters: {
                    startdatum: option.some('Januar 2016'),
                    zieldatum: option.some('Januar 2017'),
                    betrag: option.some(70000.0),
                    indexbasis: option.some('Dezember 2015'),
                },
            };
            expect(teuerungsrechnerReducer(allParametersSetPrecondition, applyBerechnen).result).toEqual({
                zielbetrag: 70281.00,
                veraenderung: 0.4,
                indexe: [{ date: 'Januar 2017', value: 99.6 }, { date: 'Februar 2017', value: 99.8 }, { date: 'März 2017', value: 100.1 }, { date: 'April 2017', value: 100.4 }, { date: 'May 2017', value: 100.6 }, { date: 'Juni 2017', value: 100.7 }, { date: 'July 2017', value: 100.3 }, { date: 'August 2017', value: 100.2 }, { date: 'September 2017', value: 100.2 }, { date: 'Oktober 2017', value: 100.3 }, { date: 'November 2017', value: 100.1 }, { date: 'Dezember 2017', value: 100.0 }, { date: 'Januar 2018', value: 100.0 }]
            })
        });
    });
});


const berchnungsdaten: TeuerungsrechnerdatenDto = {
    timeDimension: [
        { id: 1, month: 1, year: 2016, name: 'Januar 2016' },
        { id: 2, month: 2, year: 2016, name: 'Februar 2016' },
        { id: 3, month: 3, year: 2016, name: 'März 2016' },
        { id: 4, month: 4, year: 2016, name: 'April 2016' },
        { id: 5, month: 5, year: 2016, name: 'Mai 2016' },
        { id: 6, month: 6, year: 2016, name: 'Juni 2016' },
        { id: 7, month: 7, year: 2016, name: 'Juli 2016' },
        { id: 8, month: 8, year: 2016, name: 'August 2016' },
        { id: 9, month: 9, year: 2016, name: 'September 2016' },
        { id: 10, month: 10, year: 2016, name: 'Oktober 2016' },
        { id: 11, month: 11, year: 2016, name: 'November 2016' },
        { id: 12, month: 12, year: 2016, name: 'Dezember 2016' },
        { id: 13, month: 1, year: 2017, name: 'Januar 2017' },
        { id: 14, month: 2, year: 2017, name: 'Februar 2017' },
        { id: 15, month: 3, year: 2017, name: 'März 2017' },
        { id: 16, month: 4, year: 2017, name: 'April 2017' },
        { id: 17, month: 5, year: 2017, name: 'Mai 2017' },
        { id: 18, month: 6, year: 2017, name: 'Juni 2017' },
        { id: 19, month: 7, year: 2017, name: 'Juli 2017' },
        { id: 20, month: 8, year: 2017, name: 'August 2017' },
        { id: 21, month: 9, year: 2017, name: 'September 2017' },
        { id: 22, month: 10, year: 2017, name: 'Oktober 2017' },
        { id: 23, month: 11, year: 2017, name: 'November 2017' },
        { id: 24, month: 12, year: 2017, name: 'Dezember 2017' }
    ],
    indexDimension: [
        { id: 1, month: 5, year: 1914, name: 'Mai 1914' },
        { id: 2, month: 8, year: 1939, name: 'August 1939' },
        { id: 3, month: 9, year: 1966, name: 'September 1966' },
        { id: 4, month: 9, year: 1977, name: 'September 1977' },
        { id: 5, month: 12, year: 1982, name: 'Dezember 1982' },
        { id: 6, month: 5, year: 1993, name: 'Mai 1993' },
        { id: 7, month: 5, year: 2000, name: 'Mai 2000' },
        { id: 8, month: 12, year: 2005, name: 'Dezember 2005' },
        { id: 9, month: 12, year: 2010, name: 'Dezember 2010' },
        { id: 10, month: 12, year: 2015, name: 'Dezember 2015' }
    ],
    facts: [
        { timeDim: 1, indexDim: 1, indexValue: 1017.1 },
        { timeDim: 2, indexDim: 1, indexValue: 1019.0 },
        { timeDim: 3, indexDim: 1, indexValue: 1022.0 },
        { timeDim: 4, indexDim: 1, indexValue: 1025.4 },
        { timeDim: 5, indexDim: 1, indexValue: 1026.9 },
        { timeDim: 6, indexDim: 1, indexValue: 1028.3 },
        { timeDim: 7, indexDim: 1, indexValue: 1023.7 },
        { timeDim: 8, indexDim: 1, indexValue: 1022.7 },
        { timeDim: 9, indexDim: 1, indexValue: 1023.3 },
        { timeDim: 10, indexDim: 1, indexValue: 1023.8 },
        { timeDim: 11, indexDim: 1, indexValue: 1021.8 },
        { timeDim: 12, indexDim: 1, indexValue: 1021.0 },
        { timeDim: 13, indexDim: 1, indexValue: 1020.7 },
        { timeDim: 14, indexDim: 1, indexValue: 1025.6 },
        { timeDim: 15, indexDim: 1, indexValue: 1027.8 },
        { timeDim: 16, indexDim: 1, indexValue: 1029.9 },
        { timeDim: 17, indexDim: 1, indexValue: 1031.8 },
        { timeDim: 18, indexDim: 1, indexValue: 1030.3 },
        { timeDim: 19, indexDim: 1, indexValue: 1027.1 },
        { timeDim: 20, indexDim: 1, indexValue: 1027.4 },
        { timeDim: 21, indexDim: 1, indexValue: 1030.0 },
        { timeDim: 22, indexDim: 1, indexValue: 1030.6 },
        { timeDim: 23, indexDim: 1, indexValue: 1029.9 },
        { timeDim: 24, indexDim: 1, indexValue: 1029.6 },

        { timeDim: 1, indexDim: 2, indexValue: 741.4 },
        { timeDim: 2, indexDim: 2, indexValue: 742.8 },
        { timeDim: 3, indexDim: 2, indexValue: 745.0 },
        { timeDim: 4, indexDim: 2, indexValue: 747.4 },
        { timeDim: 5, indexDim: 2, indexValue: 748.5 },
        { timeDim: 6, indexDim: 2, indexValue: 749.6 },
        { timeDim: 7, indexDim: 2, indexValue: 746.2 },
        { timeDim: 8, indexDim: 2, indexValue: 745.5 },
        { timeDim: 9, indexDim: 2, indexValue: 745.9 },
        { timeDim: 10, indexDim: 2, indexValue: 746.3 },
        { timeDim: 11, indexDim: 2, indexValue: 744.8 },
        { timeDim: 12, indexDim: 2, indexValue: 744.2 },
        { timeDim: 13, indexDim: 2, indexValue: 744.0 },
        { timeDim: 14, indexDim: 2, indexValue: 747.6 },
        { timeDim: 15, indexDim: 2, indexValue: 749.2 },
        { timeDim: 16, indexDim: 2, indexValue: 750.7 },
        { timeDim: 17, indexDim: 2, indexValue: 752.1 },
        { timeDim: 18, indexDim: 2, indexValue: 751.0 },
        { timeDim: 19, indexDim: 2, indexValue: 748.7 },
        { timeDim: 20, indexDim: 2, indexValue: 748.9 },
        { timeDim: 21, indexDim: 2, indexValue: 750.8 },
        { timeDim: 22, indexDim: 2, indexValue: 751.3 },
        { timeDim: 23, indexDim: 2, indexValue: 750.7 },
        { timeDim: 24, indexDim: 2, indexValue: 750.5 },

        { timeDim: 1, indexDim: 3, indexValue: 328.2 },
        { timeDim: 2, indexDim: 3, indexValue: 328.8 },
        { timeDim: 3, indexDim: 3, indexValue: 329.7 },
        { timeDim: 4, indexDim: 3, indexValue: 330.8 },
        { timeDim: 5, indexDim: 3, indexValue: 331.3 },
        { timeDim: 6, indexDim: 3, indexValue: 331.8 },
        { timeDim: 7, indexDim: 3, indexValue: 330.3 },
        { timeDim: 8, indexDim: 3, indexValue: 330.0 },
        { timeDim: 9, indexDim: 3, indexValue: 330.2 },
        { timeDim: 10, indexDim: 3, indexValue: 330.3 },
        { timeDim: 11, indexDim: 3, indexValue: 329.7 },
        { timeDim: 12, indexDim: 3, indexValue: 329.4 },
        { timeDim: 13, indexDim: 3, indexValue: 329.3 },
        { timeDim: 14, indexDim: 3, indexValue: 330.9 },
        { timeDim: 15, indexDim: 3, indexValue: 331.6 },
        { timeDim: 16, indexDim: 3, indexValue: 332.3 },
        { timeDim: 17, indexDim: 3, indexValue: 332.9 },
        { timeDim: 18, indexDim: 3, indexValue: 332.4 },
        { timeDim: 19, indexDim: 3, indexValue: 331.4 },
        { timeDim: 20, indexDim: 3, indexValue: 331.5 },
        { timeDim: 21, indexDim: 3, indexValue: 332.3 },
        { timeDim: 22, indexDim: 3, indexValue: 332.5 },
        { timeDim: 23, indexDim: 3, indexValue: 332.3 },
        { timeDim: 24, indexDim: 3, indexValue: 332.2 },

        { timeDim: 1, indexDim: 4, indexValue: 194.7 },
        { timeDim: 2, indexDim: 4, indexValue: 195.0 },
        { timeDim: 3, indexDim: 4, indexValue: 195.6 },
        { timeDim: 4, indexDim: 4, indexValue: 196.2 },
        { timeDim: 5, indexDim: 4, indexValue: 196.5 },
        { timeDim: 6, indexDim: 4, indexValue: 196.8 },
        { timeDim: 7, indexDim: 4, indexValue: 195.9 },
        { timeDim: 8, indexDim: 4, indexValue: 195.7 },
        { timeDim: 9, indexDim: 4, indexValue: 195.8 },
        { timeDim: 10, indexDim: 4, indexValue: 195.9 },
        { timeDim: 11, indexDim: 4, indexValue: 195.6 },
        { timeDim: 12, indexDim: 4, indexValue: 195.4 },
        { timeDim: 13, indexDim: 4, indexValue: 195.3 },
        { timeDim: 14, indexDim: 4, indexValue: 196.3 },
        { timeDim: 15, indexDim: 4, indexValue: 196.7 },
        { timeDim: 16, indexDim: 4, indexValue: 197.1 },
        { timeDim: 17, indexDim: 4, indexValue: 197.5 },
        { timeDim: 18, indexDim: 4, indexValue: 197.2 },
        { timeDim: 19, indexDim: 4, indexValue: 196.6 },
        { timeDim: 20, indexDim: 4, indexValue: 196.6 },
        { timeDim: 21, indexDim: 4, indexValue: 197.1 },
        { timeDim: 22, indexDim: 4, indexValue: 197.2 },
        { timeDim: 23, indexDim: 4, indexValue: 197.1 },
        { timeDim: 24, indexDim: 4, indexValue: 197.0 },

        { timeDim: 1, indexDim: 5, indexValue: 156.1 },
        { timeDim: 2, indexDim: 5, indexValue: 156.4 },
        { timeDim: 3, indexDim: 5, indexValue: 156.9 },
        { timeDim: 4, indexDim: 5, indexValue: 157.4 },
        { timeDim: 5, indexDim: 5, indexValue: 157.6 },
        { timeDim: 6, indexDim: 5, indexValue: 157.8 },
        { timeDim: 7, indexDim: 5, indexValue: 157.1 },
        { timeDim: 8, indexDim: 5, indexValue: 157.0 },
        { timeDim: 9, indexDim: 5, indexValue: 157.1 },
        { timeDim: 10, indexDim: 5, indexValue: 157.2 },
        { timeDim: 11, indexDim: 5, indexValue: 156.8 },
        { timeDim: 12, indexDim: 5, indexValue: 156.7 },
        { timeDim: 13, indexDim: 5, indexValue: 156.7 },
        { timeDim: 14, indexDim: 5, indexValue: 157.4 },
        { timeDim: 15, indexDim: 5, indexValue: 157.8 },
        { timeDim: 16, indexDim: 5, indexValue: 158.1 },
        { timeDim: 17, indexDim: 5, indexValue: 158.4 },
        { timeDim: 18, indexDim: 5, indexValue: 158.1 },
        { timeDim: 19, indexDim: 5, indexValue: 157.7 },
        { timeDim: 20, indexDim: 5, indexValue: 157.7 },
        { timeDim: 21, indexDim: 5, indexValue: 158.1 },
        { timeDim: 22, indexDim: 5, indexValue: 158.2 },
        { timeDim: 23, indexDim: 5, indexValue: 158.1 },
        { timeDim: 24, indexDim: 5, indexValue: 158.0 },

        { timeDim: 1, indexDim: 6, indexValue: 112.7 },
        { timeDim: 2, indexDim: 6, indexValue: 113.0 },
        { timeDim: 3, indexDim: 6, indexValue: 113.3 },
        { timeDim: 4, indexDim: 6, indexValue: 113.7 },
        { timeDim: 5, indexDim: 6, indexValue: 113.8 },
        { timeDim: 6, indexDim: 6, indexValue: 114.0 },
        { timeDim: 7, indexDim: 6, indexValue: 113.5 },
        { timeDim: 8, indexDim: 6, indexValue: 113.4 },
        { timeDim: 9, indexDim: 6, indexValue: 113.4 },
        { timeDim: 10, indexDim: 6, indexValue: 113.5 },
        { timeDim: 11, indexDim: 6, indexValue: 113.3 },
        { timeDim: 12, indexDim: 6, indexValue: 113.2 },
        { timeDim: 13, indexDim: 6, indexValue: 113.1 },
        { timeDim: 14, indexDim: 6, indexValue: 113.7 },
        { timeDim: 15, indexDim: 6, indexValue: 113.9 },
        { timeDim: 16, indexDim: 6, indexValue: 114.2 },
        { timeDim: 17, indexDim: 6, indexValue: 114.4 },
        { timeDim: 18, indexDim: 6, indexValue: 114.2 },
        { timeDim: 19, indexDim: 6, indexValue: 113.9 },
        { timeDim: 20, indexDim: 6, indexValue: 113.9 },
        { timeDim: 21, indexDim: 6, indexValue: 114.2 },
        { timeDim: 22, indexDim: 6, indexValue: 114.2 },
        { timeDim: 23, indexDim: 6, indexValue: 114.2 },
        { timeDim: 24, indexDim: 6, indexValue: 114.1 },

        { timeDim: 1, indexDim: 7, indexValue: 106.3 },
        { timeDim: 2, indexDim: 7, indexValue: 106.5 },
        { timeDim: 3, indexDim: 7, indexValue: 106.8 },
        { timeDim: 4, indexDim: 7, indexValue: 107.1 },
        { timeDim: 5, indexDim: 7, indexValue: 107.3 },
        { timeDim: 6, indexDim: 7, indexValue: 107.4 },
        { timeDim: 7, indexDim: 7, indexValue: 107.0 },
        { timeDim: 8, indexDim: 7, indexValue: 106.9 },
        { timeDim: 9, indexDim: 7, indexValue: 106.9 },
        { timeDim: 10, indexDim: 7, indexValue: 107.0 },
        { timeDim: 11, indexDim: 7, indexValue: 106.8 },
        { timeDim: 12, indexDim: 7, indexValue: 106.7 },
        { timeDim: 13, indexDim: 7, indexValue: 106.6 },
        { timeDim: 14, indexDim: 7, indexValue: 107.2 },
        { timeDim: 15, indexDim: 7, indexValue: 107.4 },
        { timeDim: 16, indexDim: 7, indexValue: 107.6 },
        { timeDim: 17, indexDim: 7, indexValue: 107.8 },
        { timeDim: 18, indexDim: 7, indexValue: 107.7 },
        { timeDim: 19, indexDim: 7, indexValue: 107.3 },
        { timeDim: 20, indexDim: 7, indexValue: 107.4 },
        { timeDim: 21, indexDim: 7, indexValue: 107.6 },
        { timeDim: 22, indexDim: 7, indexValue: 107.7 },
        { timeDim: 23, indexDim: 7, indexValue: 107.6 },
        { timeDim: 24, indexDim: 7, indexValue: 107.6 },

        { timeDim: 1, indexDim: 8, indexValue: 101.0 },
        { timeDim: 2, indexDim: 8, indexValue: 101.2 },
        { timeDim: 3, indexDim: 8, indexValue: 101.5 },
        { timeDim: 4, indexDim: 8, indexValue: 101.8 },
        { timeDim: 5, indexDim: 8, indexValue: 102.0 },
        { timeDim: 6, indexDim: 8, indexValue: 102.1 },
        { timeDim: 7, indexDim: 8, indexValue: 101.6 },
        { timeDim: 8, indexDim: 8, indexValue: 101.5 },
        { timeDim: 9, indexDim: 8, indexValue: 101.6 },
        { timeDim: 10, indexDim: 8, indexValue: 101.7 },
        { timeDim: 11, indexDim: 8, indexValue: 101.5 },
        { timeDim: 12, indexDim: 8, indexValue: 101.4 },
        { timeDim: 13, indexDim: 8, indexValue: 101.3 },
        { timeDim: 14, indexDim: 8, indexValue: 101.8 },
        { timeDim: 15, indexDim: 8, indexValue: 102.0 },
        { timeDim: 16, indexDim: 8, indexValue: 102.3 },
        { timeDim: 17, indexDim: 8, indexValue: 102.4 },
        { timeDim: 18, indexDim: 8, indexValue: 102.3 },
        { timeDim: 19, indexDim: 8, indexValue: 102.0 },
        { timeDim: 20, indexDim: 8, indexValue: 102.0 },
        { timeDim: 21, indexDim: 8, indexValue: 102.3 },
        { timeDim: 22, indexDim: 8, indexValue: 102.3 },
        { timeDim: 23, indexDim: 8, indexValue: 102.3 },
        { timeDim: 24, indexDim: 8, indexValue: 102.2 },

        { timeDim: 1, indexDim: 9, indexValue: 96.9 },
        { timeDim: 2, indexDim: 9, indexValue: 97.1 },
        { timeDim: 3, indexDim: 9, indexValue: 97.4 },
        { timeDim: 4, indexDim: 9, indexValue: 97.7 },
        { timeDim: 5, indexDim: 9, indexValue: 97.9 },
        { timeDim: 6, indexDim: 9, indexValue: 98.0 },
        { timeDim: 7, indexDim: 9, indexValue: 97.6 },
        { timeDim: 8, indexDim: 9, indexValue: 97.5 },
        { timeDim: 9, indexDim: 9, indexValue: 97.5 },
        { timeDim: 10, indexDim: 9, indexValue: 97.6 },
        { timeDim: 11, indexDim: 9, indexValue: 97.4 },
        { timeDim: 12, indexDim: 9, indexValue: 97.3 },
        { timeDim: 13, indexDim: 9, indexValue: 97.3 },
        { timeDim: 14, indexDim: 9, indexValue: 97.7 },
        { timeDim: 15, indexDim: 9, indexValue: 97.9 },
        { timeDim: 16, indexDim: 9, indexValue: 98.1 },
        { timeDim: 17, indexDim: 9, indexValue: 98.3 },
        { timeDim: 18, indexDim: 9, indexValue: 98.2 },
        { timeDim: 19, indexDim: 9, indexValue: 97.9 },
        { timeDim: 20, indexDim: 9, indexValue: 97.9 },
        { timeDim: 21, indexDim: 9, indexValue: 98.2 },
        { timeDim: 22, indexDim: 9, indexValue: 98.2 },
        { timeDim: 23, indexDim: 9, indexValue: 98.1 },
        { timeDim: 24, indexDim: 9, indexValue: 98.1 },

        { timeDim: 1, indexDim: 10, indexValue: 99.6 },
        { timeDim: 2, indexDim: 10, indexValue: 99.8 },
        { timeDim: 3, indexDim: 10, indexValue: 100.1 },
        { timeDim: 4, indexDim: 10, indexValue: 100.4 },
        { timeDim: 5, indexDim: 10, indexValue: 100.6 },
        { timeDim: 6, indexDim: 10, indexValue: 100.7 },
        { timeDim: 7, indexDim: 10, indexValue: 100.3 },
        { timeDim: 8, indexDim: 10, indexValue: 100.2 },
        { timeDim: 9, indexDim: 10, indexValue: 100.2 },
        { timeDim: 10, indexDim: 10, indexValue: 100.3 },
        { timeDim: 11, indexDim: 10, indexValue: 100.1 },
        { timeDim: 12, indexDim: 10, indexValue: 100.0 },
        { timeDim: 13, indexDim: 10, indexValue: 100.0 },
        { timeDim: 14, indexDim: 10, indexValue: 100.4 },
        { timeDim: 15, indexDim: 10, indexValue: 100.7 },
        { timeDim: 16, indexDim: 10, indexValue: 100.9 },
        { timeDim: 17, indexDim: 10, indexValue: 101.0 },
        { timeDim: 18, indexDim: 10, indexValue: 100.9 },
        { timeDim: 19, indexDim: 10, indexValue: 100.6 },
        { timeDim: 20, indexDim: 10, indexValue: 100.6 },
        { timeDim: 21, indexDim: 10, indexValue: 100.9 },
        { timeDim: 22, indexDim: 10, indexValue: 100.9 },
        { timeDim: 23, indexDim: 10, indexValue: 100.9 },
        { timeDim: 24, indexDim: 10, indexValue: 100.8 },

    ],
}