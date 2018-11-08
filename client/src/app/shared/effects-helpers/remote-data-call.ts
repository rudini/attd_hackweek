import { Action } from '@ngrx/store';
import * as either from 'fp-ts/lib/Either';
import { concat, merge, Observable, of } from 'rxjs';
import { mergeMap, shareReplay, switchMap } from 'rxjs/operators';
import { GlobalAction } from '../global-action';
import { failure, BfsRemoteData, loading, RemoteDataError, success } from '../remote-data';
import { fromFilteredLeft, fromFilteredRight } from '../rx-helpers';

import Either = either.Either;

export type RemoteDataErrorGlobalHandler = (e: RemoteDataError) => Action[];

export type RemoteDataCallOptions = {
    preLoadingActions?: Action[];
    postLoadingActions?: Action[];
    remoteDataErrorGlobalHandler?: RemoteDataErrorGlobalHandler;
};

export const defaultRemoteDataErrorGlobalHandler: RemoteDataErrorGlobalHandler = e => [
    GlobalAction.globalRemoteDataError(e),
];

const getRemoteDataCallOptionsWithDefaults = (options: RemoteDataCallOptions) => ({
    preLoadingActions: options.preLoadingActions || [],
    postLoadingActions: options.postLoadingActions || [],
    remoteDataErrorGlobalHandler: options.remoteDataErrorGlobalHandler || defaultRemoteDataErrorGlobalHandler,
});

export function makeRemoteDataCall<T>(
    serviceCall: Observable<Either<RemoteDataError, T>>,
    actionCreator: (v: BfsRemoteData<T>) => Action,
    options: RemoteDataCallOptions = {},
) {
    const {
        preLoadingActions,
        postLoadingActions,
        remoteDataErrorGlobalHandler,
    } = getRemoteDataCallOptionsWithDefaults(options);

    return concat(
        [...preLoadingActions, actionCreator(loading), ...postLoadingActions],
        serviceCall.pipe(
            mergeMap(x => [
                actionCreator(x.fold<BfsRemoteData<T>>(failure, success)),
                ...x.fold(remoteDataErrorGlobalHandler, () => []),
            ]),
        ),
    );
}

export function makeRemoteDataCallTransform<T, U>(
    serviceCall: Observable<Either<RemoteDataError, T>>,
    project: (v: BfsRemoteData<T>) => U,
    actionCreator: (v: U) => Action,
    options: RemoteDataCallOptions = {},
) {
    const {
        preLoadingActions,
        postLoadingActions,
        remoteDataErrorGlobalHandler,
    } = getRemoteDataCallOptionsWithDefaults(options);

    return concat(
        [...preLoadingActions, actionCreator(project(loading)), ...postLoadingActions],
        serviceCall.pipe(
            mergeMap(x => [
                actionCreator(project(x.fold<BfsRemoteData<T>>(failure, success))),
                ...x.fold(remoteDataErrorGlobalHandler, () => []),
            ]),
        ),
    );
}

export function makeRemoteDataCallChain<T>(
    serviceCall: Observable<Either<RemoteDataError, T>>,
    actionCreator: (v: BfsRemoteData<T>) => Action,
    options: RemoteDataCallOptions = {},
) {
    const {
        preLoadingActions,
        postLoadingActions,
        remoteDataErrorGlobalHandler,
    } = getRemoteDataCallOptionsWithDefaults(options);

    const serviceCall$ = serviceCall.pipe(shareReplay(1));
    const data$ = serviceCall$.pipe(fromFilteredRight());
    const error$ = serviceCall$.pipe(fromFilteredLeft());

    const actionStream$ = concat(
        [...preLoadingActions, actionCreator(loading), ...postLoadingActions],
        serviceCall$.pipe(
            mergeMap(x => [
                actionCreator(x.fold<BfsRemoteData<T>>(failure, success)),
                ...x.fold(remoteDataErrorGlobalHandler, () => []),
            ]),
        ),
    );

    return of({
        data$,
        error$,
        actionStream$,
    });
}

export function makeRemoteDataCallChain2<T>(
    serviceCall: Observable<Either<RemoteDataError, T>>,
    actionCreator: (v: BfsRemoteData<T>) => Action,
    onData$: Observable<Action>,
    options: RemoteDataCallOptions = {},
) {
    const {
        preLoadingActions,
        postLoadingActions,
        remoteDataErrorGlobalHandler,
    } = getRemoteDataCallOptionsWithDefaults(options);

    const serviceCall$ = serviceCall.pipe(shareReplay(1));
    const data$ = serviceCall$.pipe(fromFilteredRight());
    // const error$ = serviceCall$.pipe(fromFilteredLeft());

    const actionStream$ = concat(
        [...preLoadingActions, actionCreator(loading), ...postLoadingActions],
        serviceCall$.pipe(
            mergeMap(x => [
                actionCreator(x.fold<BfsRemoteData<T>>(failure, success)),
                ...x.fold(remoteDataErrorGlobalHandler, () => []),
            ]),
        ),
    );

    return merge(actionStream$, data$.pipe(switchMap(() => onData$)));

    // return of({
    //     data$,
    //     error$,
    //     actionStream$,
    // });
}

export function makeRemoteDataCallTransformChain<T, U>(
    serviceCall: Observable<Either<RemoteDataError, T>>,
    project: (v: BfsRemoteData<T>) => U,
    actionCreator: (v: U) => Action,
    options: RemoteDataCallOptions = {},
) {
    const {
        preLoadingActions,
        postLoadingActions,
        remoteDataErrorGlobalHandler,
    } = getRemoteDataCallOptionsWithDefaults(options);

    const serviceCall$ = serviceCall.pipe(shareReplay(1));
    const data$ = serviceCall$.pipe(fromFilteredRight());
    const error$ = serviceCall$.pipe(fromFilteredLeft());

    const actionStream$ = concat(
        [...preLoadingActions, actionCreator(project(loading)), ...postLoadingActions],
        serviceCall$.pipe(
            mergeMap(x => [
                actionCreator(project(x.fold<BfsRemoteData<T>>(failure, success))),
                ...x.fold(remoteDataErrorGlobalHandler, () => []),
            ]),
        ),
    );

    return of({
        data$,
        error$,
        actionStream$,
    });
}
