import unionize, { ofType } from 'unionize';

import { RemoteDataError } from '../remote-data';

export const GlobalAction = unionize(
    {
        globalRemoteDataError: ofType<RemoteDataError>(),
        globalClearError: ofType<null>(),
    },
    'type',
    'payload',
);
export type GlobalAction = typeof GlobalAction._Union;
