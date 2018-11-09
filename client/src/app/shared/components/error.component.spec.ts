import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { NgxFpTsModule } from 'ngx-fp-ts';
import { Component, LOCALE_ID, Input } from '@angular/core';
import * as option from 'fp-ts/lib/Option';

// impl
@Component({
    selector: 'app-error',
    template: `
        <div>
            <ng-content></ng-content>
        </div>`
})
export class ErrorComponent {
    @Input()
    error: any;
}
// impl end


@Component({
    template: `
      <app-error>
        <div data-id="nested-component"></div>
      </app-error>`
})
class TestHostComponent { }

describe('error component spec', () => {
    let testee: ErrorComponent;
    let fixture: ComponentFixture<ErrorComponent>;
    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgxFpTsModule],
            declarations: [ErrorComponent, TestHostComponent],
            providers: [{ provide: LOCALE_ID, useValue: 'de-CH' }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorComponent);
        hostFixture = TestBed.createComponent(TestHostComponent);
        testee = fixture.componentInstance;
        fixture.detectChanges();
    });

    // on success should render the nested component | OK
    // on error should show the error message
    describe('on error', () => {
        it('it should show an error message', () => {
            // TODO: implement
            return 'pending';
        });
    });

    describe('on success', () => {
        it('it should show the nested component', () => {
            // Arrange
            testee.error = option.none;

            // Act
            hostFixture.detectChanges();
            const node: HTMLElement = hostFixture.elementRef.nativeElement;

            // Assert
            expect(node.querySelector('[data-id="nested-component"]')).not.toBe(null);
        });
    });
});
