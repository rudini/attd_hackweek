import { EventEmitter } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { withLatestFrom, filter, mapTo, map } from "rxjs/operators";
import { BerechnungsParameterModel } from "../models";
import { TeuerungsrechnerActions } from "../+state/actions";
import { teuerungsrechnerSelectors } from "../+state/reducer";
import { ContainerComponent } from "@shared/reactive-component";

// @Component({
//     template: ''
// })
export class TeuerungsrechnerPageComponent extends ContainerComponent {
    parameterChanged$ = new EventEmitter<Partial<BerechnungsParameterModel>>();
    berechnen$ = new EventEmitter();

    canBerechnen$: Observable<boolean>;
    result$: Observable<any>;

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