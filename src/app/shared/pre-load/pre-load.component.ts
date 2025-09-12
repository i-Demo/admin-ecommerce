import { Component, signal } from '@angular/core';
import { DialogLoaderModule } from 'rbn-common-lib';

@Component({
    selector: 'app-pre-load',
    imports: [DialogLoaderModule],
    templateUrl: './pre-load.component.html',
    styleUrl: './pre-load.component.scss'
})
export class PreLoadComponent {
    show = signal(true); // Show loader default

    hide() {
        this.show.set(false); 
    }
}
