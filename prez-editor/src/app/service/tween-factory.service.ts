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

import { Injectable } from '@angular/core';
import { Store, State } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/filter';
import { Subject } from 'rxjs/Subject';

import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import * as _ from 'lodash';

import { Render } from '../interface/render.interface';

import * as CAMERAS from '../store/cameras.store';
import { Camera } from '../model/camera.model';

@Injectable()
export class TweenFactoryService {

  // store
  private camera: Observable<Camera> = new Observable<Camera>();

  constructor(private store: Store<CAMERAS.CamerasAppState>) {
    this.camera = this.store.select<Camera>('Camera');
  }

  /**
   * move camera to this point
   * @param camera 
   * @param renderer 
   * @param previous 
   * @param target 
   */
  public goto(camera: THREE.PerspectiveCamera, previous: THREE.Mesh, target: THREE.Mesh, where: number, callback: any): TWEEN.Tween {
    let from = Object.assign({}, camera.position);
    let to = Object.assign({}, target.position);
    to.z += where;
    let that = this;
    // Place camera on x axis
    return new TWEEN.Tween(from)
      .to(to, 2000)
      .easing(TWEEN.Easing.Quintic.InOut).onUpdate(function () {
        // dispatch new position event
        // use that due to TWEEN is upgrading scope
        that.store.dispatch({
          type: CAMERAS.updateCameraPosition,
          payload: Object.assign({}, this)
        });
      }).onComplete(function () {
        callback();
      });
  }

  /**
   * camera look at this object (target)
   * @param camera 
   * @param renderer 
   * @param previous 
   * @param target 
   */
  public lookAt(camera: THREE.PerspectiveCamera, previous: THREE.Mesh, target: THREE.Mesh, callback: any): TWEEN.Tween {
    let from = Object.assign({}, previous.position);
    let to = Object.assign({}, target.position);
    let that = this;
    // Place camera on x axis
    return new TWEEN.Tween(from)
      .to(to, 2000)
      .easing(TWEEN.Easing.Quintic.InOut).onUpdate(function () {
        // dispatch new lookat position event
        // use that due to TWEEN is upgrading scope
        that.store.dispatch({
          type: CAMERAS.updateCameraLookAtPosition,
          payload: Object.assign({}, this)
        });
      }).onComplete(function () {
        callback();
      });
  }
}
