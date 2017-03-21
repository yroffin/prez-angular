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

import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import * as _ from 'lodash';

import { Render } from '../interface/render.interface';
import { Link } from '../model/link.model';

@Injectable()
export class TweenFactoryService {

  constructor() { }

  /**
   * move camera to this point
   * @param camera 
   * @param renderer 
   * @param previous 
   * @param target 
   */
  public goto(camera: THREE.PerspectiveCamera, renderer: Render, previous: THREE.Mesh, target: THREE.Mesh, where: number): TWEEN.Tween {
    let from = Object.assign({}, camera.position);
    let to = Object.assign({}, target.position);
    to.z += where;
    let that = this;
    // Place camera on x axis
    return new TWEEN.Tween(from).to(to, 2000)
      .easing(TWEEN.Easing.Quintic.InOut).onUpdate(function () {
        camera.position.x = this.x;
        camera.position.y = this.y;
        camera.position.z = this.z;
        renderer.render();
      }).onComplete(function () {
        camera.position.x = this.x;
        camera.position.y = this.y;
        camera.position.z = this.z;
        renderer.render();
      }).start();
  }

  /**
   * camera look at this object (target)
   * @param camera 
   * @param renderer 
   * @param previous 
   * @param target 
   */
  public lookAt(camera: THREE.PerspectiveCamera, renderer: Render, previous: THREE.Mesh, target: THREE.Mesh): TWEEN.Tween {
    let from = Object.assign({}, previous.position);
    let to = Object.assign({}, target.position);
    let that = this;
    // Place camera on x axis
    return new TWEEN.Tween(from).to(to, 2000)
      .easing(TWEEN.Easing.Quintic.InOut).onUpdate(function () {
        camera.lookAt(this);
        renderer.render();
      }).onComplete(function () {
        camera.lookAt(this);
        renderer.render();
      }).start();
  }
}
