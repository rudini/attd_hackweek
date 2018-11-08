import { Option } from "fp-ts/lib/Option";

export interface BerechnungsParameterModel {
    startdatum: string;
    zieldatum: string;
    indexbasis: string;
    betrag: number;
}

export type ResultModel = {
    zielbetrag: Option<number>,
    veraenderung: Option<number>,
    indexe: Option<{date: string, value: number}[]>
};