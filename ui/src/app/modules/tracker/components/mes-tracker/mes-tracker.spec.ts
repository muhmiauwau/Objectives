import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesTracker } from './mes-tracker';

describe('MesTracker', () => {
  let component: MesTracker;
  let fixture: ComponentFixture<MesTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesTracker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesTracker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
