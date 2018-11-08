import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { Component, Input, LOCALE_ID, EventEmitter } from '@angular/core';
import { ResultModel, BerechnungsParameterModel } from '@teuerungsrechner/models';
import * as option from 'fp-ts/lib/Option';
import { NgxFpTsModule } from 'ngx-fp-ts';
import localeDECH from '@angular/common/locales/de-CH';
import { registerLocaleData } from '@angular/common';
import { cold } from 'jest-marbles';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

registerLocaleData(localeDECH);
// impl
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

// impl ends

describe('teuerungsrechner component spec', () => {
    let testee: TeuerungsrechnerComponent;
    let fixture: ComponentFixture<TeuerungsrechnerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgxFpTsModule, ReactiveFormsModule],
            declarations: [TeuerungsrechnerComponent],
            providers: [{ provide: LOCALE_ID, useValue: 'de-CH' }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TeuerungsrechnerComponent);
        testee = fixture.componentInstance;
        fixture.detectChanges();
    });

    // on resultat changed -> set inputs | OK
    // on canBerechnen -> show berechnen button | OK
    // when berechnen clicked -> emit berechnen event | OK
    // when parameter changed -> emit parameters event
    describe('on resultat changed', () => {
        it('it should set input data', () => {
            // Act
            testee.berechnungsdaten = option.some({
                zielbetrag: 70281.0,
                veraenderung: 0.4,
                indexe: [
                    { date: 'Januar 2016', value: 99.6 },
                    { date: 'Februar 2016', value: 99.8 },
                    { date: 'März 2016', value: 100.1 },
                    { date: 'April 2016', value: 100.4 },
                    { date: 'Mai 2016', value: 100.6 },
                    { date: 'Juni 2016', value: 100.7 },
                    { date: 'Juli 2016', value: 100.3 },
                    { date: 'August 2016', value: 100.2 },
                    { date: 'September 2016', value: 100.2 },
                    { date: 'Oktober 2016', value: 100.3 },
                    { date: 'November 2016', value: 100.1 },
                    { date: 'Dezember 2016', value: 100.0 },
                    { date: 'Januar 2017', value: 100.0 },
                ],
            });
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            // Assert
            expect(node.querySelector('[data-e2e="zielbetrag"]').innerHTML).toBe('70’281.00');
        });
    });

    describe('on can berechnen changed', () => {
        it('it should enable the berechnen button if can berechnen is true', () => {
            // Act
            testee.canBerechnen = true;
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            // Assert
            expect((node.querySelector('[data-e2e="berechnen"]') as HTMLInputElement).disabled).toBe(false);
        });
        it('it should disable the berechnen button if can berechnen is false', () => {
            // Act
            testee.canBerechnen = false;
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            // Assert
            expect((node.querySelector('[data-e2e="berechnen"]') as HTMLInputElement).disabled).toBe(true);
        });
    });

    describe('on berechnen clicked', () => {
        it('it should emit berechnen event', () => {
            // Assert
            testee.canBerechnen = true;
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            // Act
            (node.querySelector('[data-e2e="berechnen"]') as HTMLInputElement).click();

            // Assert
            expect(testee.onBerechnenClicked$).toBeObservable(cold('a', { a: '' }));
        });
    });

    describe('on parameter changed', () => {
        it('it should parameters changed event', () => {
            const subscription = testee.parameterChanged$.subscribe();
            // Act
            testee.form.setValue({
                startdatum: 'Januar 2016',
                zieldatum: 'Januar 2017',
                betrag: '70000.00',
                indexbasis: 'Dezember 2015',
            });
            fixture.detectChanges();

            // Assert
            const expected: BerechnungsParameterModel = {
                startdatum: 'Januar 2016',
                zieldatum: 'Januar 2017',
                betrag: 70000,
                indexbasis: 'Dezember 2015',
            };
            expect(testee.parameterChanged$).toBeObservable(cold('a', { a: expected }));
            subscription.unsubscribe();
        });
    });
});
