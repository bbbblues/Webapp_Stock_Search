import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsChartsComponent } from './details-charts.component';

describe('DetailsChartsComponent', () => {
  let component: DetailsChartsComponent;
  let fixture: ComponentFixture<DetailsChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
