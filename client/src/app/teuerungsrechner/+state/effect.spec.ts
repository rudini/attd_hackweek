import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, Effect } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, ReplaySubject } from 'rxjs';
import { TeuerungsrechnerActions } from './actions';
import { AppConfigService } from '@shared/services/environment-service';
import { mergeMap, filter, mapTo } from 'rxjs/operators';

// load data from server { loading: xxx }
// validate response { data: Option<xxx> }
// dispatch action to store { payload: xxx }
// -- server error handling (conneciton, 404, 503..) { error: ServerError }
// -- invalid data { error: ValidationError }
// -- dispatch error { payload: error }
describe('teuerungsrechner effects tests', () => {

    let injector: TestBed;
    let httpMock: HttpTestingController;
    let effect: TeuerungsrechnerEffect;
    let actions: Subject<any>;
    let url: string;

    const mockAppConfigService = () => {
        return { buildApiUrl: () => url }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TeuerungsrechnerEffect, { provide: AppConfigService, useFactory: mockAppConfigService }, provideMockActions(() => actions)]
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
        httpMock.expectOne(url);
    });

    // it('should xxx data from server', () => {
    //     // Arrange
    //     actions = new ReplaySubject(1);

    //     // Act
    //     actions.next(TeuerungsrechnerActions.datenLaden(null));

    //     // Assert
    //     expect(effect.onLoad$).toBeMarble('a');
    // });
});

@Injectable()
export class TeuerungsrechnerEffect {
    constructor(private actions$: Actions, private http: HttpClient, private appConfigService: AppConfigService) { }

    @Effect()
    onLoad$ = this.actions$
        .pipe(
            filter(TeuerungsrechnerActions.is.datenLaden),
            mergeMap(x => datenLaden(this.http, this.appConfigService)),
            mapTo({}));
}

export const datenLaden = (http: HttpClient, appConfigService: AppConfigService) =>
    http.get<string>(appConfigService.buildApiUrl('api/teuerungsrechnerdaten'));

