import { Cases, SingleValueVariants, unionize, Unionized } from 'unionize';
export { ofType } from 'unionize';

type SelectorFunctionMap<T, A> = { [K in keyof T]: (a: A) => T[K] };

function defineSelectors<TState, Record, TSelectorFunctionMap extends SelectorFunctionMap<any, TState>>(
    actions: Unionized<Record, SingleValueVariants<Record, 'type', 'payload'>>,
    reducer: (state: TState | undefined, action: typeof actions._Union) => TState,
    selectors: TSelectorFunctionMap,
) {
    return {
        actions,
        reducer,
        selectors,
        declareSelectors<P extends SelectorFunctionMap<any, TState>>(fn: (x: TSelectorFunctionMap) => P) {
            const combinedSelectors = {} as TSelectorFunctionMap & P;
            for (const tag in selectors) {
                if (selectors.hasOwnProperty(tag)) {
                    combinedSelectors[tag] = selectors[tag];
                }
            }
            const _selectors = fn(selectors);
            for (const tag in _selectors) {
                if (_selectors.hasOwnProperty(tag)) {
                    combinedSelectors[tag] = _selectors[tag];
                }
            }
            return defineSelectors(actions, reducer, combinedSelectors);
        },
    };
}

function _reducer<TState, Record, K extends keyof Record>(
    initialState: TState,
    actions: Unionized<Record, SingleValueVariants<Record, 'type', 'payload'>>,
    reducer: (state: TState) => Cases<Record, K, TState>,
) {
    const __reducer = (state: TState = initialState, action: typeof actions._Union) =>
        actions.match(reducer(state), () => state)(action);
    return {
        actions,
        reducer: __reducer,
        declareSelectors<TSelectorFunctionMap extends SelectorFunctionMap<any, TState>>(
            _selectors: TSelectorFunctionMap,
        ) {
            return defineSelectors(actions, __reducer, _selectors);
        },
    };
}

function _actions<TState, Record>(
    initialState: TState,
    actions: Unionized<Record, SingleValueVariants<Record, 'type', 'payload'>>,
) {
    return {
        actions,
        declareReducer<K extends keyof Record>(reducer: (state: TState) => Cases<Record, K, TState>) {
            return _reducer(initialState, actions, reducer);
        },
    };
}

function _init<TState>(initialState: TState) {
    return {
        declareActions<Record>(record: Record) {
            return _actions(initialState, unionize(record, 'type', 'payload'));
        },
    };
}

export function reduxBuilder<TState>() {
    return {
        declareInitialState(initialState: TState) {
            return _init(initialState);
        },
    };
}

// export function reselectSelectors<TParentState, TState, TSelectorFunctionMap extends SelectorFunctionMap<any, TState>>(
//     featureSelector: MemoizedSelector<object, TState>,
//     selectors: TSelectorFunctionMap,
// ) {
//     const _selectors = {} as any;
//     for (const tag in selectors) {
//         if (selectors.hasOwnProperty(tag)) {
//             _selectors[tag] = createSelector(featureSelector, selectors[tag]);
//         }
//     }
//     return _selectors as SelectorFunctionMap<{ getArticleIndex: 1 }, TParentState>;
// }
