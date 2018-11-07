import { ResultModel } from "../models";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { BfsRemoteData } from "@shared/remote-data";
import { TeuerungsrechnerdatenDto } from "@teuerungsrechner/contracts";
import { Option } from "fp-ts/lib/Option";

export type Parameters = { 
    startdatum: Option<string>, 
    zieldatum: Option<string>, 
    betrag: Option<number>,
    indexbasis: Option<string>
};

export type TeuerungsrechnerStore = {
    canBerechnen: boolean;
    result: ResultModel;
    datenLaden: BfsRemoteData<TeuerungsrechnerdatenDto>;
    parameters: Parameters;
};

export const getTeuerungsrechnerState = createFeatureSelector<TeuerungsrechnerStore>('teuerungsrechner');
export const teuerungsrechnerSelectors = {
    getCanBerechnen: createSelector(getTeuerungsrechnerState, state => state.canBerechnen),
    getResult: createSelector(getTeuerungsrechnerState, state => state.result),
};