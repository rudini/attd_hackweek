import { ResultModel } from "../models";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { BfsRemoteData, initial } from "@shared/remote-data";
import { TeuerungsrechnerdatenDto } from "@teuerungsrechner/contracts";
import { Option } from "fp-ts/lib/Option";
import * as option from 'fp-ts/lib/Option';
import * as array from 'fp-ts/lib/Array';
import { reduxBuilder } from "@shared/redux-builder";
import { teuerungsrechnerActionsRecord } from "./actions";

export type Parameters = { 
    startdatum: Option<string>, 
    zieldatum: Option<string>, 
    betrag: Option<number>,
    indexbasis: Option<string>
};

export type TeuerungsrechnerStore = {
    canBerechnen: boolean;
    result: Option<ResultModel>;
    datenLaden: BfsRemoteData<TeuerungsrechnerdatenDto>;
    parameters: Parameters;
};


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

function berechneResultat(state: TeuerungsrechnerStore): Option<ResultModel> {

    const indexMap = state.datenLaden.data.map(x => x.timeDimension.reduce((acc, curr) => ({
        ...acc, [curr.id]: curr.name
    }), {} as {[timeDim: number]: string}))

    const startdatum = state.datenLaden.data
        .map(x => x.timeDimension
            .filter(
                f => state.parameters.startdatum
                    .map(s => s === f.name).getOrElse(false))).mapNullable(arr => arr[0])
        .map(i => i.id)
        .getOrElse(-1);

    const zieldatum = state.datenLaden.data
        .map(x => x.timeDimension
            .filter(
                f => state.parameters.zieldatum
                    .map(s => s === f.name).getOrElse(false))).mapNullable(arr => arr[0])
        .map(i => i.id)
        .getOrElse(-1);

    const indexbasis = state.datenLaden.data
        .map(x => x.indexDimension.filter(f => state.parameters.indexbasis.map(s => s === f.name).getOrElse(false)))
        .mapNullable(arr => arr[0])
        .map(i => i.id)
        .getOrElse(-1);

    const allIndexes = state.datenLaden.data
        .map(d => d.facts.filter(x => x.timeDim >= startdatum && x.timeDim <= zieldatum && x.indexDim === indexbasis))
        .map(v => v.map(x => ({
            timeDim: x.timeDim,
            indexValue: x.indexValue
        })));

    const first = allIndexes.chain(arr => array.head(arr));
    const last = allIndexes.chain(arr => array.last(arr));

    const veraenderung = last.chain(l => first.map(f => (l.indexValue - f.indexValue)/f.indexValue*100));
    const zielbetrag = state.parameters.betrag.chain(b => veraenderung.map(v => b * v / 100 + b));
    const indexe = allIndexes.map(x => x.map(i => ({
        value: i.indexValue,
        date: indexMap.map(m => m[i.timeDim]).toNullable()
    })));

    const hasAllValues = veraenderung.chain(v => zielbetrag).chain(z => indexe).isSome();
    return !hasAllValues ? option.none : option.some({
        veraenderung: veraenderung.map(v => +v.toFixed(1)).toNullable(),
        zielbetrag: zielbetrag.map(z => Math.floor(z)).toNullable(),
        indexe: indexe.toNullable()
    });
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

export const getTeuerungsrechnerState = createFeatureSelector<TeuerungsrechnerStore>('teuerungsrechner');
export const teuerungsrechnerSelectors = {
    getCanBerechnen: createSelector(getTeuerungsrechnerState, state => state.canBerechnen),
    getResult: createSelector(getTeuerungsrechnerState, state => state.result),
};