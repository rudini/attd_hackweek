import { Component, Input, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { Observable } from "rxjs";
import { BerechnungsParameterModel, ResultModel } from "@teuerungsrechner/models";
import { map, shareReplay } from "rxjs/operators";
import * as option from 'fp-ts/lib/Option';

@Component({
    template: `
    <form [formGroup]="form">
        <label for="startdatum">Startdatum: </label><input id="startdatum" formControlName="startdatum" data-e2e="startdatum" type="text">
        <label for="zieldatum">Startdatum: </label><input id="zieldatum" formControlName="zieldatum" data-e2e="zieldatum" type="text">
        <label for="betrag">Startdatum: </label><input id="betrag" formControlName="betrag" data-e2e="betrag" type="number">
        <label for="indexbasis">Startdatum: </label><input id="indexbasis" formControlName="indexbasis" data-e2e="indexbasis" type="text">
    </form>
    <ng-container *ifSome="berechnungsdaten; let berechnungsdaten">
    <p data-e2e="zielbetrag">{{berechnungsdaten.zielbetrag | number:'1.2-2'}}</p>
    </ng-container>
    <button data-e2e="berechnen" type="submit" (click)="onBerechnenClicked$.emit()" [disabled]="!canBerechnen">Berechnen</button>
    `,
})
export class TeuerungsrechnerComponent {
    @Input()
    berechnungsdaten: option.Option<ResultModel> = option.none;
    @Input()
    canBerechnen: boolean;
    onBerechnenClicked$ = new EventEmitter();

    form: FormGroup;
    // parameterChanged$ = new EventEmitter<BerechnungsParameterModel>();
    parameterChanged$: Observable<BerechnungsParameterModel>;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            startdatum: '',
            zieldatum: '',
            betrag: '',
            indexbasis: '',
        });

        this.parameterChanged$ = this.form.valueChanges.pipe(map(data => ({
            startdatum: data.startdatum,
            zieldatum: data.zieldatum,
            betrag: +data.betrag,
            indexbasis: data.indexbasis,
        })), shareReplay(1));
    }
}