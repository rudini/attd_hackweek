import { ResultModel } from "../models";
import { createFeatureSelector, createSelector } from "@ngrx/store";

export type TeuerungsrechnerStore = {
    canBerechnen: boolean;
    result: ResultModel;
};

export const getTeuerungsrechnerState = createFeatureSelector<TeuerungsrechnerStore>('teuerungsrechner');
export const teuerungsrechnerSelectors = {
    getCanBerechnen: createSelector(getTeuerungsrechnerState, state => state.canBerechnen),
    getResult: createSelector(getTeuerungsrechnerState, state => state.result),
};