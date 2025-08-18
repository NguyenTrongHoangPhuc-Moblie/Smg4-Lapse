import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { CardSwipeComponent } from '../card-swipe/card-swipe.component';
import { StatsbarComponent } from '../statsbar/statsbar.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage, CardSwipeComponent, StatsbarComponent],
})
export class HomePageModule {}
