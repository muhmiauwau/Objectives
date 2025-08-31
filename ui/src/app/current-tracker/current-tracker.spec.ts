import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentTracker } from './current-tracker';

describe('CurrentTracker', () => {
  let component: CurrentTracker;
  let fixture: ComponentFixture<CurrentTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentTracker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentTracker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
