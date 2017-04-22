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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';

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

import { addOrUpdateSlide, SlidesAppState, selectSlideItemEvent } from '../../store/slides.store';
import * as CAMERAS from '../../store/cameras.store';

import { Slide } from '../../model/slide.model';
import { Camera } from '../../model/camera.model';
import { SlideItem, SlideEvent } from '../../model/slide-item.model';

@Component({
  selector: 'app-prez-3d-canvas',
  templateUrl: './prez-3d-canvas.component.html',
  styleUrls: ['./prez-3d-canvas.component.css']
})
export class Prez3dCanvasComponent implements OnInit, AfterViewInit {

  @ViewChild(Prez3dSceneComponent) scene: Prez3dSceneComponent
  @ViewChild(Prez3dElementCameraComponent) camera: Prez3dElementCameraComponent
  @ViewChild(Prez3dElementMeshComponent) mesh: Prez3dElementMeshComponent

  private msgs: Message[];
  private slide: Observable<SlideItem> = new Observable<SlideItem>();

  // current target pieces (first piece at the begining)
  private target: SlideItem;
  private title: string;

  /**
   * constructor
   * @param _el base element used for resize handler and threejs hanchor
   * @param _renderer local renderer
   */
  constructor(
    private store: Store<SlidesAppState>
  ) {
    /**
     * register to store Slides
     */
    this.slide = this.store.select<SlideItem>('Slide');

    /**
     * load data
     */
    this.load();

    /**
     * register to slide selection, filter on null values
     */
    this.slide
      .filter(item => {
        if (item) {
          return true
        } else {
          return false
        }
      })
      .subscribe((item) => {
        this.target = item;
        this.title = this.target.getSlide().getName();
      });
  }

  /**
   * 
   * @param name dispatch slide loading
   * @param url 
   * @param position 
   */
  private dispatchSlideLoading(id: string, name: string, url: string, position: THREE.Vector3, rotation: THREE.Vector3) {
    this.store.dispatch({
      type: addOrUpdateSlide,
      payload: new Slide(id, name, url, position, rotation)
    });
  }

  /**
   * 
   * @param name dispatch slide loading
   * @param url 
   * @param position 
   */
  private dispatchCameraReset(name: string, position: THREE.Vector3, lookAtPosition: THREE.Vector3) {
    let cam = new Camera(name, position, lookAtPosition);
    this.store.dispatch({
      type: CAMERAS.addOrUpdateCamera,
      payload: cam
    });
    this.store.dispatch({
      type: CAMERAS.selectCamera,
      payload: cam
    });
  }

  /**
   * load a sample data
   */
  public load() {
    let sample: any = {
      "#1": {
        "name": "Slide 001",
        "url": "/assets/svg/00071.svg",
        "position": {
          "x": 0,
          "y": 0,
          "z": 0
        }, "rotation": { "x": 0, "y": 0, "z": 0 }
      },
      "#2": {
        "name": "Slide 002",
        "url": "/assets/svg/00071b.svg",
        "position": {
          "x": 400,
          "y": 0,
          "z": 0
        }, "rotation": { "x": 0, "y": 0, "z": 0 }
      },
      "#3": {
        "name": "Slide 003",
        "url": "/assets/svg/00071.svg",
        "position": {
          "x": 400,
          "y": 400,
          "z": 0
        }, "rotation": { "x": 0, "y": 0, "z": 0 }
      },
      "#4": {
        "name": "Slide 004",
        "url": "/assets/svg/00071b.svg",
        "position": {
          "x": 0,
          "y": 400,
          "z": 0
        }, "rotation": { "x": 0, "y": 0, "z": 0 }
      },
      "#5": {
        "name": "Slide 005",
        "url": "/assets/svg/00071.svg",
        "position": {
          "x": 0,
          "y": 0,
          "z": -400
        }, "rotation": { "x": 0, "y": 0, "z": 0 }
      },
      "#6": {
        "name": "Slide 006",
        "url": "/assets/svg/00071b.svg",
        "position": {
          "x": 400,
          "y": 0,
          "z": -40000
        }, "rotation": { "x": 0, "y": 0, "z": 0 }
      },
      "#7": {
        "name": "Slide 007",
        "url": "/assets/svg/00071.svg",
        "position": {
          "x": 400,
          "y": 400,
          "z": -400
        }, "rotation": { "x": 0, "y": 0, "z": 0 }
      },
      "#8": {
        "name": "Slide 008",
        "url": "/assets/svg/00071b.svg",
        "position": {
          "x": 0,
          "y": 400,
          "z": -400
        }, "rotation": { "x": 0, "y": 0, "z": 0 }
      }
    };
    _.each(sample, (slide, key) => {
      this.dispatchSlideLoading(
        key,
        slide.name,
        slide.url,
        new THREE.Vector3(slide.position.x, slide.position.y, slide.position.z),
        new THREE.Vector3(slide.rotation.x, slide.rotation.y, slide.rotation.z)
      );
    });
    // add a single camera
    this.dispatchCameraReset("Default", new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
  }

  /**
   * load a sample data
   */
  public add() {
    this.dispatchSlideLoading("#9", "Slide 001", '/assets/svg/00071.svg', new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
    this.dispatchCameraReset("Default", new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
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
    this.run();
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
      } else {
        if (event.node.data.mesh && event.node.data.mesh.constructor && event.node.data.mesh.constructor.name === "Mesh") {
          /**
           * send selection event
           */
          this.store.dispatch({
            type: selectSlideItemEvent,
            payload: new SlideEvent().setSlideItem(<SlideItem>event.node.data)
          });
        }
      }
    }
  }

  nodeUnselect(event) {
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Unselected', detail: event.node.label });
  }

  /**
     * calback runner
     */
  private run() {
    setTimeout(() => {
      TWEEN.update();
      this.run();
    }, 10);
  }
}
