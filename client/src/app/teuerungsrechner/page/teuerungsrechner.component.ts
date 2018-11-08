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
        <label for="startdatum">Startdatum: </label><input id="startdatum" formControlName="startdatum" data-e2e="startdatum" type="text">
        <label for="zieldatum">Zieldatum: </label><input id="zieldatum" formControlName="zieldatum" data-e2e="zieldatum" type="text">
        <label for="betrag">Betrag: </label><input id="betrag" formControlName="betrag" data-e2e="betrag" type="number">
        <label for="indexbasis">Indexbasis: </label><input id="indexbasis" formControlName="indexbasis" data-e2e="indexbasis" type="text">
    </form>
    <ng-container *ifSome="berechnungsdaten; let berechnungsdaten">
        <p>Zielbetrag: <span data-e2e="zielbetrag">{{berechnungsdaten.zielbetrag | number:'1.2-2'}}</span></p>
        <p>Veraenderung: <span data-e2e="veraenderung">{{berechnungsdaten.veraenderung | number:'1.1-1'}}%</span></p>
        <table data-e2e="indexe">
            <thead>
                <tr>
                    <th data-e2e="index-header" *ngFor="let index of berechnungsdaten.indexe">{{index.date}}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td data-e2e="index-value" *ngFor="let index of berechnungsdaten.indexe">{{index.value | number:'1.1-1'}}</td>
                </tr>
            </tbody>
        </table>
    </ng-container>
    <button data-e2e="berechnen" type="submit" (click)="onBerechnenClicked$.emit()" [disabled]="!canBerechnen">Berechnen</button>
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