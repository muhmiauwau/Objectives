import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarratorMsg } from './narrator-msg';

describe('NarratorMsg', () => {
  let component: NarratorMsg;
  let fixture: ComponentFixture<NarratorMsg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NarratorMsg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NarratorMsg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
