import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PreLoadComponent } from './shared/pre-load/pre-load.component';
import { ToastModule } from 'primeng/toast';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, TranslateModule, PreLoadComponent, ToastModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    @ViewChild('loader') loader!: PreLoadComponent;

    ngAfterViewInit() {
        setTimeout(() => {
            this.loader.hide();
        }, 1000);
    }
}
