import { EventEmitter, Component } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { withLatestFrom, filter, mapTo, map } from "rxjs/operators";
import { BerechnungsParameterModel, ResultModel } from "../models";
import { TeuerungsrechnerActions } from "../+state/actions";
import { teuerungsrechnerSelectors } from "../+state/reducer";
import { ContainerComponent } from "@shared/reactive-component";
import { Option } from "fp-ts/lib/Option";

@Component({
    template: '<div></div>'
})
export class TeuerungsrechnerPageComponent extends ContainerComponent {
    parameterChanged$ = new EventEmitter<Partial<BerechnungsParameterModel>>();
    berechnen$ = new EventEmitter();

    canBerechnen$: Observable<boolean>;
    result$: Observable<Option<ResultModel>>;

    constructor(private store: Store<any>) {
        super(store.dispatch.bind(store));

        this.store.dispatch(TeuerungsrechnerActions.datenLaden(null));

        this.canBerechnen$ = this.store.select(teuerungsrechnerSelectors.getCanBerechnen);
        this.result$ = this.store.select(teuerungsrechnerSelectors.getResult);

        this.dispatch(
            this.parameterChanged$.pipe(
                map(parameters => TeuerungsrechnerActions.applyBerechnungsParameterChanged(parameters))
            ),
            this.berechnen$.pipe(
                withLatestFrom(this.canBerechnen$),
                filter(([_, canBerechnen]) => canBerechnen),
                mapTo(TeuerungsrechnerActions.applyBerechne(null))
            )
        );
    }
}