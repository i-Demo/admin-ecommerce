import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';

// Mock TranslatePipe
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'translate', standalone: true })
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any { return value; }
}

interface Item {
  id: number;
  name: string;
  status: string;
}

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, MockTranslatePipe],
  templateUrl: './demo-page.component.html',
})
export class DemoPageComponent {
  private router = inject(Router);

  items: Item[] = Array.from({ length: 25 }).map((_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    status: i % 2 === 0 ? 'Active' : 'Inactive'
  }));

  searchTerm = signal('');
  pageSize = 5;
  currentPage = 1;
  totalPages = Math.ceil(this.items.length / this.pageSize);
  isLightTheme = signal(true);

  filteredItems = signal<Item[]>(this.items.slice(0, this.pageSize));

  constructor() {
    effect(() => this.updateFilteredItems());
  }

  updateFilteredItems() {
    const filtered = this.items.filter(i => i.name.toLowerCase().includes(this.searchTerm().toLowerCase()));
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredItems.set(filtered.slice(start, start + this.pageSize));
  }

  toggleTheme() {
    this.isLightTheme.set(!this.isLightTheme());
  }

  logout() {
    this.router.navigate(['/login']);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateFilteredItems();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateFilteredItems();
    }
  }
}
