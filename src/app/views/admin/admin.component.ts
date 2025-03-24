import { Component } from '@angular/core';
import { UserCreationFormComponent } from "./shared/user-creation-form/user-creation-form.component";

@Component({
  selector: 'app-admin',
  imports: [UserCreationFormComponent],
  templateUrl: './admin.component.html',
})
export default class AdminComponent {

}
