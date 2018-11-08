export interface BerechnungsParameterModel {
    startdatum: string;
    zieldatum: string;
    indexbasis: string;
    betrag: number;
}

export type ResultModel = {
    zielbetrag: number,
    veraenderung: number,
    indexe: {date: string, value: number}[]
};