import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-pre-load',
    imports: [],
    templateUrl: './pre-load.component.html',
    styleUrl: './pre-load.component.scss'
})
export class PreLoadComponent {
    show = signal(true); // bật loader mặc định

    hide() {
        this.show.set(false); // gọi khi muốn ẩn
    }
}
