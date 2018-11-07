import { ResultModel } from "../models";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { BfsRemoteData } from "@shared/remote-data";
import { TeuerungsrechnerdatenDto } from "@teuerungsrechner/contracts";

export type TeuerungsrechnerStore = {
    canBerechnen: boolean;
    result: ResultModel;
    datenLaden: BfsRemoteData<TeuerungsrechnerdatenDto>;
};

export const getTeuerungsrechnerState = createFeatureSelector<TeuerungsrechnerStore>('teuerungsrechner');
export const teuerungsrechnerSelectors = {
    getCanBerechnen: createSelector(getTeuerungsrechnerState, state => state.canBerechnen),
    getResult: createSelector(getTeuerungsrechnerState, state => state.result),
};