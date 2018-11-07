import { reduxBuilder } from "@shared/redux-builder";
import { teuerungsrechnerActionsRecord, TeuerungsrechnerActions } from "./actions";
import { TeuerungsrechnerStore } from "./reducer";


const initialState = {
}

const built = reduxBuilder().declareInitialState(initialState)
    .declareActions(teuerungsrechnerActionsRecord)
    .declareReducer(() => ({}));

export const reducer = (state: TeuerungsrechnerStore, action: TeuerungsrechnerActions) => built.reducer(state, action);

// Initialize data for datastore | OK
// Daten geladen =>
// -- loading
// -- data
// -- error
// Parameter updates => set canBerechnen
// Berechnen when all parameters are set
describe('teuerungsrechner reducer tests', () => {

    describe('on initialize', () => {
        it('it should set the initial state', () => {
            expect(reducer(undefined, {} as any)).toEqual(initialState);
        })
    })
});
