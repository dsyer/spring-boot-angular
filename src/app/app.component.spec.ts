import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [HttpClientTestingModule]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Demo'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Demo');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const req = TestBed.inject(HttpTestingController).expectOne('resource');
    expect(req.request.method).toEqual('GET');
    req.flush({ "id": "1234", "content": "Hello" });
    fixture.whenRenderingDone().then(
      () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.content span')?.textContent).toContain('Hello');
      }
    )
    fixture.detectChanges();
  });
});
