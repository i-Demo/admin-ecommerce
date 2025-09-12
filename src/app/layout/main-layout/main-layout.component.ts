import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../core/header/header.component';
import { SidebarComponent } from '../../core/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  isCollapse: boolean = false;
  isInit: boolean = false;

  ngOnInit(): void {
    this.checkWindowWidth(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowWidth(event.target.innerWidth);
  }

  private checkWindowWidth(width: number): void {
    if (this.isInit) {
      this.isCollapse = width <= 1000;
    } else {
      this.isInit = true;
    }
  }

  toggleSidebar(event: any) {
    this.isCollapse = !this.isCollapse
    console.log(event);

  }
}
