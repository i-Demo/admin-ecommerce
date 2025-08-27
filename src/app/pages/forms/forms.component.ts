import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HighlightDirective } from '../../shared/hightlight.directive';

@Component({
  selector: 'app-forms',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, HighlightDirective],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss'
})
export class FormsComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });
  submit() { alert(JSON.stringify(this.form.value)); }
}
