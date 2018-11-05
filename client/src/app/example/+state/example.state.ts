import { createFeatureSelector, createSelector } from '@ngrx/store';
import { reduxBuilder, ofType } from 'src/app/shared/redux-builder';

export type ExampleState = {
    readonly collection: number[];
};

const built = reduxBuilder<ExampleState>()
    .declareInitialState({ collection: [] })
    .declareActions({ addToCollection: ofType<number>(), removeFromCollection: ofType<number>(), clearCollection: ofType<null>() })
    .declareReducer(s => ({
        addToCollection: (number) => ({ ...s, collection: [...s.collection, number]}),
        removeFromCollection: (index) => ({ ...s, collection: s.collection.filter((_, i) => i !== index) }),
        clearCollection: () => ({ ...s, collection: [] })
    }))
    .declareSelectors({
        getCollection: s => s.collection,
    });

export const getExampleState = createFeatureSelector<ExampleState>('Example');
export const { actions: ExampleAction } = built;
export type ExampleAction = typeof ExampleAction._Union;

export const exampleSelectors = {
    getCollection: createSelector(getExampleState, built.selectors.getCollection),
};

export function exampleReducer(state: ExampleState, action: ExampleAction): ExampleState {
    return built.reducer(state, action);
}
