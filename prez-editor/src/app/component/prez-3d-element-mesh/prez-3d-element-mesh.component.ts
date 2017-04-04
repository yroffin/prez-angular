/* 
 * Copyright 2016 Yannick Roffin.
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

import { Component, OnInit, AfterViewInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Spinner } from 'primeng/primeng';

import * as THREE from 'three';

import {
  SlideItemAppState,
  updateSlidePosX,
  updateSlidePosY,
  updateSlidePosZ,
  updateSlideRotX,
  updateSlideRotY,
  updateSlideRotZ
} from '../../store/slides.store';
import { SlideItem, SlideEvent } from '../../model/slide-item.model';
import { Slide } from '../../model/slide.model';

@Component({
  selector: 'app-prez-3d-element-mesh',
  templateUrl: './prez-3d-element-mesh.component.html',
  styleUrls: ['./prez-3d-element-mesh.component.css']
})
export class Prez3dElementMeshComponent implements OnInit, AfterViewInit {

  /**
   * spinner children
   */
  @ViewChildren('spinnerPosX')
  public spinPosXChild: QueryList<Spinner>;
  @ViewChildren('spinnerPosY')
  public spinPosYChild: QueryList<Spinner>;
  @ViewChildren('spinnerPosZ')
  public spinPosZChild: QueryList<Spinner>;
  @ViewChildren('spinnerRotX')
  public spinRotXChild: QueryList<Spinner>;
  @ViewChildren('spinnerRotY')
  public spinRotYChild: QueryList<Spinner>;
  @ViewChildren('spinnerRotZ')
  public spinRotZChild: QueryList<Spinner>;

  /**
   * spinner
   */
  public spinPosX: Spinner;
  public spinPosY: Spinner;
  public spinPosZ: Spinner;
  public spinRotX: Spinner;
  public spinRotY: Spinner;
  public spinRotZ: Spinner;

  /**
   * internal threejs members
   */
  public target: SlideItem;
  public slide: Slide;

  /**
   * constructor
   * @param store
   */
  constructor(
    private store: Store<SlideItemAppState>
  ) {

  }

  /**
   * component init
   */
  ngOnInit() {
    /**
     * store init
     */
    let slideEventStore = this.store.select<SlideEvent>('SlideEvent');

    /**
     * register to slide event
     */
    slideEventStore.subscribe((item) => {
      if (item && item.getSlideItem()) {
        this.target = item.getSlideItem();
        this.slide = item.getSlideItem().getSlide();
      }
    });
  }

  /**
   * after view init
   */
  ngAfterViewInit() {
    this.spinPosXChild.changes.subscribe((comps: QueryList<Spinner>) => {
      if (comps.first) {
        this.spinPosX = comps.first;
        this.spinPosX.registerOnChange((event) => {
          this.store.dispatch({
            type: updateSlidePosX,
            payload: this.spinPosX.value
          });
        });
      }
    });
    this.spinPosYChild.changes.subscribe((comps: QueryList<Spinner>) => {
      if (comps.first) {
        this.spinPosY = comps.first;
        this.spinPosY.registerOnChange((event) => {
          this.store.dispatch({
            type: updateSlidePosY,
            payload: this.spinPosY.value
          });
        });
      }
    });
    this.spinPosZChild.changes.subscribe((comps: QueryList<Spinner>) => {
      if (comps.first) {
        this.spinPosZ = comps.first;
        this.spinPosZ.registerOnChange((event) => {
          this.store.dispatch({
            type: updateSlidePosZ,
            payload: this.spinPosZ.value
          });
        });
      }
    });
    this.spinRotXChild.changes.subscribe((comps: QueryList<Spinner>) => {
      if (comps.first) {
        this.spinRotX = comps.first;
        this.spinRotX.registerOnChange((event) => {
          this.store.dispatch({
            type: updateSlideRotX,
            payload: this.spinRotX.value
          });
        });
      }
    });
    this.spinRotYChild.changes.subscribe((comps: QueryList<Spinner>) => {
      if (comps.first) {
        this.spinRotY = comps.first;
        this.spinRotY.registerOnChange((event) => {
          this.store.dispatch({
            type: updateSlideRotY,
            payload: this.spinRotY.value
          });
        });
      }
    });
    this.spinRotZChild.changes.subscribe((comps: QueryList<Spinner>) => {
      if (comps.first) {
        this.spinRotZ = comps.first;
        this.spinRotZ.registerOnChange((event) => {
          this.store.dispatch({
            type: updateSlideRotZ,
            payload: this.spinRotZ.value
          });
        });
      }
    });
  }

  /**
   * next slide
   * @param slide
   */
  private next(item: SlideItem) {
  }

  /**
   * previous slide
   * @param slide
   */
  private previous(item: SlideItem) {
  }
}
