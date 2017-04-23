/* 
 * Copyright 2017 Yannick Roffin.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

import { OverlayPanelModule } from 'primeng/primeng';
import { ButtonModule } from 'primeng/primeng';
import { ChartModule } from 'primeng/primeng';
import { DataTableModule, SharedModule } from 'primeng/primeng';
import { MenubarModule, MenuModule } from 'primeng/primeng';
import { CheckboxModule } from 'primeng/primeng';
import { InputTextModule } from 'primeng/primeng';
import { AccordionModule } from 'primeng/primeng';
import { CodeHighlighterModule } from 'primeng/primeng';
import { InputTextareaModule } from 'primeng/primeng';
import { DataListModule } from 'primeng/primeng';
import { TabViewModule } from 'primeng/primeng';
import { DataGridModule } from 'primeng/primeng';
import { PanelModule } from 'primeng/primeng';
import { GrowlModule } from 'primeng/primeng';
import { StepsModule } from 'primeng/primeng';
import { PanelMenuModule } from 'primeng/primeng';
import { DialogModule } from 'primeng/primeng';
import { FieldsetModule } from 'primeng/primeng';
import { DropdownModule } from 'primeng/primeng';
import { ConfirmDialogModule, ConfirmationService } from 'primeng/primeng';
import { SplitButtonModule } from 'primeng/primeng';
import { ToolbarModule } from 'primeng/primeng';
import { TooltipModule } from 'primeng/primeng';
import { TreeTableModule } from 'primeng/primeng';
import { TreeModule } from 'primeng/primeng';
import { CalendarModule } from 'primeng/primeng';
import { SpinnerModule } from 'primeng/primeng';
import { SliderModule } from 'primeng/primeng';
import { ToggleButtonModule } from 'primeng/primeng';

import { PrezHomeComponent } from './component/prez-home/prez-home.component';
import { Prez3dCanvasComponent } from './component/prez-3d-canvas/prez-3d-canvas.component';
import { Prez3dSceneComponent } from './component/prez-3d-scene/prez-3d-scene.component';

import { LoggerService } from './service/logger.service';
import { TweenFactoryService } from './service/tween-factory.service';
import { CanvasDataService } from './service/canvas-data.service';
import { Prez3dElementCameraComponent } from './component/prez-3d-element-camera/prez-3d-element-camera.component';
import { Prez3dElementMeshComponent } from './component/prez-3d-element-mesh/prez-3d-element-mesh.component';

import { StoreModule } from '@ngrx/store';
import { SlidesStore } from './store/slides.store';
import { CamerasStore } from './store/cameras.store';
import { Slide } from './model/slide.model';
import { SlideEvent } from './model/slide-item.model';

/**
 * default route definition
 */
const appRoutes: Routes = [
  { path: 'three', component: Prez3dCanvasComponent },
  { path: '', component: Prez3dCanvasComponent },
  { path: '**', component: Prez3dCanvasComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    PrezHomeComponent,
    Prez3dCanvasComponent,
    Prez3dSceneComponent,
    Prez3dElementCameraComponent,
    Prez3dElementMeshComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    /**
     * primeface
     */
    DataTableModule,
    SharedModule,
    MenuModule,
    MenubarModule,
    CheckboxModule,
    InputTextModule,
    AccordionModule,
    CodeHighlighterModule,
    InputTextareaModule,
    DataListModule,
    TabViewModule,
    DataGridModule,
    PanelModule,
    GrowlModule,
    StepsModule,
    ButtonModule,
    OverlayPanelModule,
    PanelMenuModule,
    DialogModule,
    FieldsetModule,
    DropdownModule,
    ConfirmDialogModule,
    SplitButtonModule,
    ToolbarModule,
    TooltipModule,
    TreeTableModule,
    TreeModule,
    ChartModule,
    CalendarModule,
    SpinnerModule,
    SliderModule,
    ToggleButtonModule,
    /**
     * routes
     */
    RouterModule.forRoot(appRoutes),
    /**
     * store
     */
    StoreModule.provideStore({
      Slides: SlidesStore.slidesReducer,
      Slide: SlidesStore.slideReducer,
      SlideEvent: SlidesStore.slideEventReducer,
      Cameras: CamerasStore.camerasReducer,
      Camera: CamerasStore.cameraReducer
    }, {
      Slides: [],
      Slide: null,
      SlideEvent: null,
      Cameras: [],
      Camera: []
    })
  ],
  providers: [
    LoggerService,
    TweenFactoryService,
    CanvasDataService
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
