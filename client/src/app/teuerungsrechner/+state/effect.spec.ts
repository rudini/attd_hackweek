import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject, Observable } from 'rxjs';
import { TeuerungsrechnerActions } from './actions';
import { AppConfigService } from '@shared/services/environment-service';
import { cold } from 'jest-marbles';
import { loading, success, failure, RemoteDataError } from '@shared/remote-data';
import { GlobalAction } from '@shared/global-action';
import { JsonDecodeError } from 'decode-ts';
import { TeuerungsrechnerdatenDto } from '@teuerungsrechner/contracts';
import { TeuerungsrechnerEffect } from './effect';

// load data from server { loading: xxx } | OK
// validate response { data: Option<xxx> } | OK
// dispatch action to store { payload: xxx } | OK
// -- server error handling (conneciton, 404, 503..) { error: ServerError } | OK
// -- invalid data { error: ValidationError } | OK
describe('teuerungsrechner effects tests', () => {
    let httpClientMock: HttpClient;
    let effect: TeuerungsrechnerEffect;
    let actions: Observable<any>;
    let url: string;

    const mockAppConfigService = () => {
        return { buildApiUrl: () => url };
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: HttpClient, useValue: { get: jest.fn() } },
                TeuerungsrechnerEffect,
                { provide: AppConfigService, useFactory: mockAppConfigService },
                provideMockActions(() => {
                    return actions;
                }),
            ],
        });
        httpClientMock = TestBed.get(HttpClient);
        effect = TestBed.get(TeuerungsrechnerEffect);
    });

    it('should load data from server', () => {
        // Arrange
        url = 'URL';
        actions = new ReplaySubject(1);
        effect.onLoad$.subscribe();
        const spy = jest.spyOn(httpClientMock, 'get');

        // Act
        (<ReplaySubject<any>>actions).next(TeuerungsrechnerActions.datenLaden(null));

        // Assert
        expect(spy).toHaveBeenCalledWith(url, expect.anything());
    });

    it('should dispatch apply datenLaden when data is valid', () => {
        // Arrange
        const data: TeuerungsrechnerdatenDto = {
            timeDimension: { id: 1, month: 1, year: 2016, name: 'Januar 2016' },
            indexDimension: { id: 1, month: 5, year: 1914, name: 'Mai 1914' },
            facts: { timeDim: 1, indexDim: 1, indexValue: 1017.1 },
        };
        const expected$ = cold('ab', {
            a: TeuerungsrechnerActions.applyDatenLaden(loading),
            b: TeuerungsrechnerActions.applyDatenLaden(success(data)),
        });
        url = 'URL';
        httpClientMock.get = jest.fn(() => cold('-a', { a: JSON.stringify(data) }));

        // Act
        actions = cold('a', { a: TeuerungsrechnerActions.datenLaden(null) });

        // Assert
        expect(effect.onLoad$).toBeObservable(expected$);
    });

    // -- server error handling (conneciton, 404, 503..) { error: ServerError }
    it('should dispatch apply datenLaden when data is valid', () => {
        // Arrange
        const expected$ = cold('a(bc)', {
            a: TeuerungsrechnerActions.applyDatenLaden(loading),
            b: TeuerungsrechnerActions.applyDatenLaden(failure(RemoteDataError.APIErrorResponse({apiErrorResponse: { status: 500, statusText: 'Internal server error', error: null }}))),
            c: GlobalAction.globalRemoteDataError(RemoteDataError.APIErrorResponse({apiErrorResponse: { status: 500, statusText: 'Internal server error', error: null }}))
        });
        url = 'URL';
        httpClientMock.get = jest.fn(() => cold('-#', {}, new HttpErrorResponse({statusText: 'Internal server error', status: 500})));

        // Act
        actions = cold('a', { a: TeuerungsrechnerActions.datenLaden(null) });

        // Assert
        expect(effect.onLoad$).toBeObservable(expected$);
    });

    it('should dispatch validation error when data is invalid', () => {
        // Arrange
        const invalidData: any = {
            timeDimension: { id: 1, month: "1", year: 2016, name: 'Januar 2016' },
            indexDimension: { id: 1, month: 5, year: 1914, name: 'Mai 1914' },
            facts: { timeDim: 1, indexDim: 1, indexValue: 1017.1 },
        };

        const expected$ = cold('a(bc)', {
            a: TeuerungsrechnerActions.applyDatenLaden(loading),
            b: TeuerungsrechnerActions.applyDatenLaden(failure(RemoteDataError.DecodeError(<any>validationErrorMessage))),
            c: GlobalAction.globalRemoteDataError(RemoteDataError.DecodeError(<any>validationErrorMessage))
        });
        url = 'URL';
        httpClientMock.get = jest.fn(() => cold('-a', { a: JSON.stringify(invalidData) }));

        // Act
        actions = cold('a', { a: TeuerungsrechnerActions.datenLaden(null) });

        // Assert
        expect(effect.onLoad$).toBeObservable(expected$);
    }) 
});

const validationErrorMessage: JsonDecodeError = JSON.parse(`{
    "decodeError": {
      "validationErrors": [
        {
          "value": "1",
          "context": [
            {
              "key": "",
              "type": {
                "name": "{ timeDimension: { id: number, month: number, year: number, name: string }, indexDimension: { id: number, month: number, year: number, name: string }, facts: { timeDim: number, indexDim: number, indexValue: number } }",
                "props": {
                  "timeDimension": {
                    "name": "{ id: number, month: number, year: number, name: string }",
                    "props": {
                      "id": {
                        "name": "number",
                        "_tag": "NumberType"
                      },
                      "month": {
                        "name": "number",
                        "_tag": "NumberType"
                      },
                      "year": {
                        "name": "number",
                        "_tag": "NumberType"
                      },
                      "name": {
                        "name": "string",
                        "_tag": "StringType"
                      }
                    },
                    "_tag": "InterfaceType"
                  },
                  "indexDimension": {
                    "name": "{ id: number, month: number, year: number, name: string }",
                    "props": {
                      "id": {
                        "name": "number",
                        "_tag": "NumberType"
                      },
                      "month": {
                        "name": "number",
                        "_tag": "NumberType"
                      },
                      "year": {
                        "name": "number",
                        "_tag": "NumberType"
                      },
                      "name": {
                        "name": "string",
                        "_tag": "StringType"
                      }
                    },
                    "_tag": "InterfaceType"
                  },
                  "facts": {
                    "name": "{ timeDim: number, indexDim: number, indexValue: number }",
                    "props": {
                      "timeDim": {
                        "name": "number",
                        "_tag": "NumberType"
                      },
                      "indexDim": {
                        "name": "number",
                        "_tag": "NumberType"
                      },
                      "indexValue": {
                        "name": "number",
                        "_tag": "NumberType"
                      }
                    },
                    "_tag": "InterfaceType"
                  }
                },
                "_tag": "InterfaceType"
              }
            },
            {
              "key": "timeDimension",
              "type": {
                "name": "{ id: number, month: number, year: number, name: string }",
                "props": {
                  "id": {
                    "name": "number",
                    "_tag": "NumberType"
                  },
                  "month": {
                    "name": "number",
                    "_tag": "NumberType"
                  },
                  "year": {
                    "name": "number",
                    "_tag": "NumberType"
                  },
                  "name": {
                    "name": "string",
                    "_tag": "StringType"
                  }
                },
                "_tag": "InterfaceType"
              }
            },
            {
              "key": "month",
              "type": {
                "name": "number",
                "_tag": "NumberType"
              }
            }
          ]
        }
      ],
      "tag": "ValidationErrors"
    }}`);