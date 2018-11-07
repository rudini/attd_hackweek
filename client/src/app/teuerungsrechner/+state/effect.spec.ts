import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, Effect } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, ReplaySubject, of, Observable } from 'rxjs';
import { TeuerungsrechnerActions } from './actions';
import { AppConfigService } from '@shared/services/environment-service';
import { mergeMap, filter, mapTo, tap } from 'rxjs/operators';
import { cold, hot } from 'jest-marbles';
import { HotObservable } from 'jest-marbles/typings/src/rxjs/hot-observable';
import { ColdObservable } from 'jest-marbles/typings/src/rxjs/cold-observable';

// load data from server { loading: xxx } | OK
// validate response { data: Option<xxx> }
// dispatch action to store { payload: xxx }
// -- server error handling (conneciton, 404, 503..) { error: ServerError }
// -- invalid data { error: ValidationError }
// -- dispatch error { payload: error }
describe('teuerungsrechner effects tests', () => {
    let httpMock: HttpTestingController;
    let effect: TeuerungsrechnerEffect;
    let actions2: HotObservable | ColdObservable;
    let actions: Subject<any>;
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
                    return actions2;
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
        actions.next(TeuerungsrechnerActions.datenLaden(null));

        // Assert
        const req = httpMock.expectOne(url);
        req.flush('{}');
    });

    it('should return some data after loading valid data from server', () => {
        // Arrange
        const data = '{asdfasd}';
        const expected$ = cold('-a', { a: {} });
        // actions = new ReplaySubject(1);
        url = 'URL';

        // Act
        actions2 = cold('a', {a: TeuerungsrechnerActions.datenLaden(null)});
        // actions.next(TeuerungsrechnerActions.datenLaden(null));

        // Assert
        // effect.onLoad$.subscribe(action => expect(action).toBe({}));
        cold('-a').subscribe(() => {
            const req = httpMock.expectOne(url);
            req.flush('{}');
        })
        expect(effect.onLoad$).toBeObservable(expected$);
    });
});

@Injectable()
export class TeuerungsrechnerEffect {
    constructor(private actions$: Actions, private http: HttpClient, private appConfigService: AppConfigService) {}

    @Effect()
    onLoad$ = this.actions$.pipe(
        tap(x => console.log('loading...', x)),
        filter(TeuerungsrechnerActions.is.datenLaden),
        tap(x => console.log('after filter', x)),
        mergeMap(x => datenLaden(this.http, this.appConfigService)),
        tap(x => console.log('did load??')),
        mapTo({})
    );
}

export const datenLaden = (http: HttpClient, appConfigService: AppConfigService) => {
    console.log('requesting');
    return http.get<string>(appConfigService.buildApiUrl('api/teuerungsrechnerdaten'));
};
