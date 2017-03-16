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

@Component({
  selector: 'app-prez-3d-element-camera',
  templateUrl: './prez-3d-element-camera.component.html',
  styleUrls: ['./prez-3d-element-camera.component.css']
})
export class Prez3dElementCameraComponent implements OnInit {

  /**
   * internal threejs members
   */
  public target: THREE.PerspectiveCamera;

  constructor() {

  }

  ngOnInit() {
  }

}
