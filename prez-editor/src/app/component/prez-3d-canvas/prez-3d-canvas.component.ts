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

import { Component, Renderer } from '@angular/core';
import { ViewChild } from '@angular/core';
import { AfterViewInit, OnInit } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

import * as TWEEN from 'tween.js';
import * as _ from 'lodash';

import { Message, TreeNode, TreeTable } from 'primeng/primeng';

import { Render } from '../../interface/render.interface';

import { Prez3dSceneComponent } from '../prez-3d-scene/prez-3d-scene.component';
import { Prez3dElementCameraComponent } from '../prez-3d-element-camera/prez-3d-element-camera.component';
import { Prez3dElementMeshComponent } from '../prez-3d-element-mesh/prez-3d-element-mesh.component';
import { LoggerService } from '../../service/logger.service';
import { TweenFactoryService } from '../../service/tween-factory.service';

import { Link } from '../../model/link.model';

@Component({
  selector: 'app-prez-3d-canvas',
  templateUrl: './prez-3d-canvas.component.html',
  styleUrls: ['./prez-3d-canvas.component.css']
})
export class Prez3dCanvasComponent implements OnInit, AfterViewInit {

  @ViewChild(Prez3dSceneComponent) scene: Prez3dSceneComponent
  @ViewChild(Prez3dElementCameraComponent) camera: Prez3dElementCameraComponent
  @ViewChild(Prez3dElementMeshComponent) mesh: Prez3dElementMeshComponent

  msgs: Message[];

  /**
   * constructor
   * @param _el base element used for resize handler and threejs hanchor
   * @param _renderer local renderer
   */
  constructor(
  ) {
  }

  /**
   * init component
   */
  ngOnInit() {
  }

  /**
   * view init
   */
  ngAfterViewInit() {
  }

  /**
   * 
   * @param event select node event
   */
  nodeSelect(event) {
    if (event.node.data && event.node.data.constructor) {
      this.msgs = [];
      this.msgs.push({ severity: 'info', summary: 'Node Selected', detail: event.node.data.constructor.name });
      this.camera.target = null;
      this.mesh.target = null;
      if (event.node.data.constructor.name === "PerspectiveCamera") {
        this.camera.target = event.node.data;
      } else {
        if (event.node.data.constructor.name === "Mesh") {
          this.mesh.target = event.node.data;
        }
      }
    }
  }

  nodeUnselect(event) {
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Unselected', detail: event.node.label });
  }
}
