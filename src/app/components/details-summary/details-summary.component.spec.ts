import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSummaryComponent } from './details-summary.component';

describe('DetailsSummaryComponent', () => {
  let component: DetailsSummaryComponent;
  let fixture: ComponentFixture<DetailsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
