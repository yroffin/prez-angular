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

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as THREE from 'three';

import { selectSlide, SlideItemAppState } from '../../store/slides.store';
import { SlideItem } from '../../model/slide-item.model';

@Component({
  selector: 'app-prez-3d-element-mesh',
  templateUrl: './prez-3d-element-mesh.component.html',
  styleUrls: ['./prez-3d-element-mesh.component.css']
})
export class Prez3dElementMeshComponent implements OnInit {

  /**
   * internal threejs members
   */
  public target: SlideItem;

  constructor(
    private store: Store<SlideItemAppState>
  ) {

  }

  ngOnInit() {
  }

  /**
   * select this slide
   * @param slide
   */
  private select(item: SlideItem) {
    this.store.dispatch({
      type: selectSlide,
      payload: item
    });
  }
}
