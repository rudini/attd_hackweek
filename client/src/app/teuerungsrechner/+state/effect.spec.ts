import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, Effect } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject, Observable } from 'rxjs';
import { TeuerungsrechnerActions } from './actions';
import { AppConfigService } from '@shared/services/environment-service';
import { mergeMap, filter } from 'rxjs/operators';
import { cold } from 'jest-marbles';
import * as t from 'io-ts';
import { success, loading } from '@shared/remote-data';
import { makeValidatedHttpGetCall } from '@shared/service-helpers';
import { makeRemoteDataCall } from '@shared/effects-helpers';

export const TimeDimensionDtoRT = t.type({
    id: t.number,
    month: t.number,
    year: t.number,
    name: t.string
});

export const IndexDimensionDtoRT = t.type({
    id: t.number,
    month: t.number,
    year: t.number,
    name: t.string
});

export const FactsDtoRT = t.type({
    timeDim: t.number,
    indexDim: t.number,
    indexValue: t.number
});

export const TeuerungsrechnerdatenDtoRT = t.type({
    timeDimension: TimeDimensionDtoRT,
    indexDimension: IndexDimensionDtoRT,
    facts: FactsDtoRT
});

export interface TimeDimensionDto extends t.TypeOf<typeof TimeDimensionDtoRT> { }
export interface IndexDimensionDto extends t.TypeOf<typeof IndexDimensionDtoRT> { }
export interface FactsDto extends t.TypeOf<typeof FactsDtoRT> { }
export interface TeuerungsrechnerdatenDto extends t.TypeOf<typeof TeuerungsrechnerdatenDtoRT> { }


// load data from server { loading: xxx } | OK
// validate response { data: Option<xxx> }
// dispatch action to store { payload: xxx }
// -- server error handling (conneciton, 404, 503..) { error: ServerError }
// -- invalid data { error: ValidationError }
// -- dispatch error { payload: error }
describe('teuerungsrechner effects tests', () => {
    let httpMock: HttpTestingController;
    let effect: TeuerungsrechnerEffect;
    let actions: Observable<any>;
    let url: string;

    const mockAppConfigService = () => {
        return { buildApiUrl: () => url };
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                TeuerungsrechnerEffect,
                { provide: AppConfigService, useFactory: mockAppConfigService },
                provideMockActions(() => {
                    return actions;
                }),
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        effect = TestBed.get(TeuerungsrechnerEffect);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should load data from server', () => {
        // Arrange
        url = 'URL';
        actions = new ReplaySubject(1);
        effect.onLoad$.subscribe();

        // Act
        (<ReplaySubject<any>>actions).next(TeuerungsrechnerActions.datenLaden(null));

        // Assert
        const req = httpMock.expectOne(url);
        req.flush('{}');
    });

    it('should return some data after loading valid data from server', () => {
        // Arrange
        const data: TeuerungsrechnerdatenDto = { 
            timeDimension: { id: 1, month: 1, year: 2016, name: "Januar 2016" },
            indexDimension: { id: 1, month: 5, year: 1914, name: 'Mai 1914' },
            facts: { timeDim: 1, indexDim: 1, indexValue: 1017.1 }
         };
        const expected$ = cold('ab', { a: TeuerungsrechnerActions.applyDatenLaden(loading),  b: TeuerungsrechnerActions.applyDatenLaden(success(data)) });
        url = 'URL';

        // Act
        actions = cold('a', { a: TeuerungsrechnerActions.datenLaden(null) });

        // Assert
        cold('-a').subscribe(() => {
            const req = httpMock.expectOne(url);
            req.flush(JSON.stringify(data));
        });
        expect(effect.onLoad$).toBeObservable(expected$);
    });
});

@Injectable()
export class TeuerungsrechnerEffect {
    constructor(private actions$: Actions, private http: HttpClient, private appConfigService: AppConfigService) { }

    @Effect()
    onLoad$ = this.actions$.pipe(
        filter(TeuerungsrechnerActions.is.datenLaden),
        mergeMap(x => makeRemoteDataCall(
            datenLaden(this.http, this.appConfigService),
            TeuerungsrechnerActions.applyDatenLaden)),
    );
}

export const datenLaden = (http: HttpClient, appConfigService: AppConfigService) => {
    console.log('requesting');
    return makeValidatedHttpGetCall(http, appConfigService.buildApiUrl('api/teuerungsrechnerdaten'), TeuerungsrechnerdatenDtoRT)
    // return http.get<string>(appConfigService.buildApiUrl('api/teuerungsrechnerdaten'));
};
