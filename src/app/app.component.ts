import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PreLoadComponent } from './shared/pre-load/pre-load.component';
import { ToastModule } from 'primeng/toast';
import { MessageToggleModule } from 'rbn-common-lib';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, TranslateModule, PreLoadComponent, ToastModule, MessageToggleModule],
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
