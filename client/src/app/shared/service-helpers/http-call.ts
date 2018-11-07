import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { jsonDecodeString } from 'decode-ts';
import * as t from 'io-ts';
import { Observable, of, of as observableOf } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import Either = either.Either;
import * as either from 'fp-ts/lib/Either';

import { RemoteDataError } from '../remote-data';

type Params = { [param: string]: string | string[] } | null;

export const defaultHeaders = new HttpHeaders().append('Content-Type', 'application/json');

export function makeValidatedHttpGetCall<A, O>(
    http: HttpClient,
    url: string,
    type: t.Type<A, O>,
    withCredentials = true,
    params: Params = null,
): Observable<Either<RemoteDataError, A>> {
    return http
        .get(url, {
            responseType: 'text',
            withCredentials: withCredentials,
            ...(params != null ? { params: new HttpParams({ fromObject: params }) } : null),
        })
        .pipe(handleHttpResponse(type));
}

export function makeValidatedHttpPostCall<A, O, B, P>(
    http: HttpClient,
    url: string,
    payloadType: t.Type<B, P>,
    body: any,
    responseType: t.Type<A, O>,
    noHeaders: boolean = false,
    withCredentials: boolean = true,
): Observable<Either<RemoteDataError, A>> {
    const encodedBody = payloadType.encode(body);
    const _headers = noHeaders ? undefined : defaultHeaders;
    return payloadType
        .decode(encodedBody)
        .fold(
            validationErrors => of(either.left(RemoteDataError.PayloadDecodeError({ validationErrors }))),
            () =>
                http
                    .post(url, encodedBody, {
                        headers: _headers,
                        responseType: 'text',
                        withCredentials: withCredentials,
                    })
                    .pipe(handleHttpResponse(responseType)),
        );
}

export function makeValidatedHttpPutCall<A, O, B, P>(
    http: HttpClient,
    url: string,
    payloadType: t.Type<B, P>,
    body: any,
    responseType: t.Type<A, O>,
    noHeaders: boolean = false,
    withCredentials: boolean = true,
): Observable<Either<RemoteDataError, A>> {
    const encodedBody = payloadType.encode(body);
    const _headers = noHeaders ? undefined : defaultHeaders;
    return payloadType.decode(encodedBody).fold(
        validationErrors => of(either.left(RemoteDataError.PayloadDecodeError({ validationErrors }))),
        () =>
            http
                .put(url, encodedBody, {
                    headers: _headers,
                    responseType: 'text',
                    withCredentials: withCredentials,
                })
                .pipe(handleHttpResponse(responseType)),
    );
}

export function makeValidatedHttpDeleteCall<A, O>(
    http: HttpClient,
    url: string,
    type: t.Type<A, O>,
    withCredentials = true,
): Observable<Either<RemoteDataError, A>> {
    return http.delete(url, { responseType: 'text', withCredentials: withCredentials }).pipe(handleHttpResponse(type));
}

export function handleHttpResponse<A, O>(type: t.Type<A, O>) {
    return (source: Observable<string>): Observable<Either<RemoteDataError, A>> =>
        source.pipe(
            map(
                (bodyText): Either<RemoteDataError, A> =>
                    jsonDecodeString<A, O>(type)(bodyText).mapLeft(decodeError =>
                        RemoteDataError.DecodeError({ decodeError }),
                    ),
            ),
            catchError((err: HttpErrorResponse) =>
                observableOf(
                    either.left<RemoteDataError, A>(
                        RemoteDataError.APIErrorResponse({
                            apiErrorResponse: {
                                status: err.status,
                                statusText: err.statusText,
                                error: err.error,
                            },
                        }),
                    ),
                ),
            ),
        );
}
