import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GoogleMapsComponent } from './google-maps/google-maps.component';
//
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot()
  ],
  declarations: [GoogleMapsComponent],
  entryComponents: [],
  providers: []
})
export class ComponentsModule {}
