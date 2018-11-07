import { reduxBuilder } from "@shared/redux-builder";
import { teuerungsrechnerActionsRecord, TeuerungsrechnerActions } from "./actions";
import { TeuerungsrechnerStore } from "./reducer";
import { initial, loading } from "@shared/remote-data";
import { none } from "fp-ts/lib/Option";

// reducer impl 
const initialState: TeuerungsrechnerStore = { datenLaden: initial, result: <any>{}, canBerechnen: false };

const built = reduxBuilder<TeuerungsrechnerStore>()
    .declareInitialState(initialState)
    .declareActions(teuerungsrechnerActionsRecord)
    .declareReducer(state => ({
        applyDatenLaden: payload => ({ ...state, datenLaden: payload })
    }));

export function teuerungsrechnerReducer(state: any, action: any) {
    return built.reducer(state, action);
}
// reducer impl end

// Initialize data for datastore | OK
// Daten geladen =>
// -- loading | OK
// -- data
// -- error
// Parameter updates => set canBerechnen
// Berechnen when all parameters are set
describe('teuerungsrechner reducer tests', () => {

    describe('on load daten', () => {
        it('it should set the loading state', () => {
            expect(teuerungsrechnerReducer(undefined, TeuerungsrechnerActions.applyDatenLaden(loading)).datenLaden.loading).toEqual(true);
        });

        it('it should set the error to none', () => {
            expect(teuerungsrechnerReducer(undefined, TeuerungsrechnerActions.applyDatenLaden(loading)).datenLaden.error).toEqual(none);
        });

        it('it should set the data to none', () => {
            expect(teuerungsrechnerReducer(undefined, TeuerungsrechnerActions.applyDatenLaden(loading)).datenLaden.data).toEqual(none);
        });
    });
});
