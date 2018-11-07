import * as t from 'io-ts';

export const TimeDimensionDtoRT = t.type({
    id: t.number,
    month: t.number,
    year: t.number,
    name: t.string,
});

export const IndexDimensionDtoRT = t.type({
    id: t.number,
    month: t.number,
    year: t.number,
    name: t.string,
});

export const FactsDtoRT = t.type({
    timeDim: t.number,
    indexDim: t.number,
    indexValue: t.number,
});

export const TeuerungsrechnerdatenDtoRT = t.type({
    timeDimension: TimeDimensionDtoRT,
    indexDimension: IndexDimensionDtoRT,
    facts: FactsDtoRT,
});

export interface TimeDimensionDto extends t.TypeOf<typeof TimeDimensionDtoRT> {}
export interface IndexDimensionDto extends t.TypeOf<typeof IndexDimensionDtoRT> {}
export interface FactsDto extends t.TypeOf<typeof FactsDtoRT> {}
export interface TeuerungsrechnerdatenDto extends t.TypeOf<typeof TeuerungsrechnerdatenDtoRT> {}
