import { Component, Input, EventEmitter, Output } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { Observable } from "rxjs";
import { BerechnungsParameterModel, ResultModel } from "@teuerungsrechner/models";
import { map, shareReplay } from "rxjs/operators";
import * as option from 'fp-ts/lib/Option';

@Component({
    selector: 'app-teuerungsrechner',
    template: `
    <form [formGroup]="form">
        <label for="startdatum">Startdatum: </label><input id="startdatum" formControlName="startdatum" data-test="startdatum" type="text">
        <label for="zieldatum">Zieldatum: </label><input id="zieldatum" formControlName="zieldatum" data-test="zieldatum" type="text">
        <label for="betrag">Betrag: </label><input id="betrag" formControlName="betrag" data-test="betrag" type="number">
        <label for="indexbasis">Indexbasis: </label><input id="indexbasis" formControlName="indexbasis" data-test="indexbasis" type="text">
    </form>
    <ng-container *ifSome="berechnungsdaten; let berechnungsdaten">
        <p>Zielbetrag: <span data-test="zielbetrag">{{berechnungsdaten.zielbetrag | number:'1.2-2'}}</span></p>
        <p>Veraenderung: <span data-test="veraenderung">{{berechnungsdaten.veraenderung | number:'1.1-1'}}%</span></p>
        <table data-test="indexe">
            <thead>
                <tr>
                    <th data-test="index-header" *ngFor="let index of berechnungsdaten.indexe">{{index.date}}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td data-test="index-value" *ngFor="let index of berechnungsdaten.indexe">{{index.value | number:'1.1-1'}}</td>
                </tr>
            </tbody>
        </table>
    </ng-container>
    <button data-test="berechnen" type="submit" (click)="onBerechnenClicked$.emit()" [disabled]="!canBerechnen">Berechnen</button>
    `,
})
export class TeuerungsrechnerComponent {
    @Input()
    berechnungsdaten: option.Option<ResultModel> = option.none;
    @Input()
    canBerechnen: boolean;
    @Output('onBerechnenClicked')
    onBerechnenClicked$ = new EventEmitter();
    @Output('parameterChanged')
    parameterChanged$: Observable<BerechnungsParameterModel>;

    form: FormGroup;
   

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