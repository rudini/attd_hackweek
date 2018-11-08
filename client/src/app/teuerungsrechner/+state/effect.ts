import { Injectable } from "@angular/core";
import { Actions, Effect } from "@ngrx/effects";
import { HttpClient } from "@angular/common/http";
import { AppConfigService } from "@shared/services/environment-service";
import { filter, mergeMap } from "rxjs/operators";
import { TeuerungsrechnerActions } from "./actions";
import { makeRemoteDataCall } from "@shared/effects-helpers";
import { makeValidatedHttpGetCall } from "@shared/service-helpers";
import { TeuerungsrechnerdatenDtoRT } from "@teuerungsrechner/contracts";


@Injectable()
export class TeuerungsrechnerEffect {
    constructor(private actions$: Actions, private http: HttpClient, private appConfigService: AppConfigService) {}

    @Effect()
    onLoad$ = this.actions$.pipe(
        filter(TeuerungsrechnerActions.is.datenLaden),
        mergeMap(() =>
            makeRemoteDataCall(datenLaden(this.http, this.appConfigService), TeuerungsrechnerActions.applyDatenLaden)
        )
    );
}

export const datenLaden = (http: HttpClient, appConfigService: AppConfigService) => {
    return makeValidatedHttpGetCall(
        http,
        appConfigService.buildApiUrl('api/teuerungsrechnerdaten'),
        TeuerungsrechnerdatenDtoRT,
        false
    );
};
