import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Element } from './element';

describe('Element', () => {
  let component: Element;
  let fixture: ComponentFixture<Element>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Element]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Element);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
