import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { Component, Input, LOCALE_ID, EventEmitter } from '@angular/core';
import { ResultModel } from '@teuerungsrechner/models';
import * as option from 'fp-ts/lib/Option';
import { NgxFpTsModule } from 'ngx-fp-ts';
import localeDECH from '@angular/common/locales/de-CH';
import { registerLocaleData } from '@angular/common';
import { cold } from 'jest-marbles';

registerLocaleData(localeDECH);
// impl
@Component({
    template: `
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

    constructor() {}
}

// impl ends

describe('teuerungsrechner component spec', () => {
    let testee: TeuerungsrechnerComponent;
    let fixture: ComponentFixture<TeuerungsrechnerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgxFpTsModule],
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
            expect(testee.onBerechnenClicked$).toBeObservable(cold('a', { a: ''}));
        });
    });
});
