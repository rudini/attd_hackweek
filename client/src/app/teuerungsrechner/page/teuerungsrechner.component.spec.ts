import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { BerechnungsParameterModel } from '@teuerungsrechner/models';
import * as option from 'fp-ts/lib/Option';
import { NgxFpTsModule } from 'ngx-fp-ts';
import localeDECH from '@angular/common/locales/de-CH';
import { registerLocaleData } from '@angular/common';
import { cold } from 'jest-marbles';
import { ReactiveFormsModule } from '@angular/forms';
import { TeuerungsrechnerComponent } from './teuerungsrechner.component';
import { shareReplay } from 'rxjs/operators';

registerLocaleData(localeDECH);

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
    // when parameter changed -> emit parameters event | OK
    describe('on resultat changed', () => {
        const testdata = option.some({
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

        it('it should set zielbetrag', () => {
            // Arrange
            testee.berechnungsdaten = testdata;

            // Act
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            // Assert
            expect(node.querySelector('[data-test="zielbetrag"]').innerHTML).toBe('70’281.00');
        });

        it('it should set veraenderung', () => {
            // Arrange
            testee.berechnungsdaten = testdata;

            // Act
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            // Assert
            expect(node.querySelector('[data-test="veraenderung"]').innerHTML).toBe('0.4%');
        });

        it('it should set indexe', () => {
            // Arrange
            testee.berechnungsdaten = testdata;

            // Act
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            const getElementsFromTable = (table: HTMLElement, name: string) => {
                let values = [];
                table.querySelectorAll(`[data-test="${name}"]`).forEach(x => values.push(x.innerHTML));
                return values;
            }

            // Assert
            expect(getElementsFromTable(node.querySelector('[data-test="indexe"]'), 'index-header')).toEqual(["Januar 2016", "Februar 2016", "März 2016", "April 2016", "Mai 2016", "Juni 2016", "Juli 2016", "August 2016", "September 2016", "Oktober 2016", "November 2016", "Dezember 2016", "Januar 2017"]);
            expect(getElementsFromTable(node.querySelector('[data-test="indexe"]'), 'index-value')).toEqual(["99.6", "99.8", "100.1", "100.4", "100.6", "100.7", "100.3", "100.2", "100.2", "100.3", "100.1", "100.0", "100.0"]);
        });
    });

    describe('on can berechnen changed', () => {
        it('it should enable the berechnen button if can berechnen is true', () => {
            // Act
            testee.canBerechnen = true;
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            // Assert
            expect((node.querySelector('[data-test="berechnen"]') as HTMLInputElement).disabled).toBe(false);
        });
        it('it should disable the berechnen button if can berechnen is false', () => {
            // Act
            testee.canBerechnen = false;
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            // Assert
            expect((node.querySelector('[data-test="berechnen"]') as HTMLInputElement).disabled).toBe(true);
        });
    });

   describe('on berechnen clicked', () => {
        it('it should emit berechnen event', () => {
            // Assert
            testee.canBerechnen = true;
            fixture.detectChanges();
            const node: HTMLElement = fixture.elementRef.nativeElement;

            const result = testee.onBerechnenClicked$.asObservable().pipe(shareReplay(1));
            result.subscribe();

            // Act
            (node.querySelector('[data-test="berechnen"]') as HTMLInputElement).click();

            // Assert
            expect(result).toBeObservable(cold('a', { a: {} }));
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
