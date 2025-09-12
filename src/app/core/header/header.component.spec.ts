import { HeaderComponent } from './header.component';
import { TestBed } from '@angular/core/testing';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../services/theme.service';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let translateService: TranslateService;
    let themeService: ThemeService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [ThemeService, TranslateService],
        });
        translateService = TestBed.inject(TranslateService);
        themeService = TestBed.inject(ThemeService);
        component = new HeaderComponent();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle theme', () => {
        const initial = themeService.isLightTheme();
        component.toggleTheme();
        expect(themeService.isLightTheme()).toBe(!initial);
    });
});
