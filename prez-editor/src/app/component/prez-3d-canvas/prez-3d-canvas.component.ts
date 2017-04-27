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

import { Message, Tree, TreeNode, TreeTable } from 'primeng/primeng';

import { Render } from '../../interface/render.interface';

import { Prez3dSceneComponent } from '../prez-3d-scene/prez-3d-scene.component';
import { Prez3dElementCameraComponent } from '../prez-3d-element-camera/prez-3d-element-camera.component';
import { Prez3dElementMeshComponent } from '../prez-3d-element-mesh/prez-3d-element-mesh.component';
import { LoggerService } from '../../service/logger.service';
import { TweenFactoryService } from '../../service/tween-factory.service';

import * as SLIDES_EVENT from '../../store/slides.store';
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

  /**
   * link to html template
   */
  @ViewChild(Tree) tree: Tree
  @ViewChild(Prez3dSceneComponent) scene: Prez3dSceneComponent
  @ViewChild(Prez3dElementCameraComponent) camera: Prez3dElementCameraComponent
  @ViewChild(Prez3dElementMeshComponent) mesh: Prez3dElementMeshComponent

  /**
   * internal members
   */
  private msgs: Message[];
  private slideObservable: Observable<SlideItem> = new Observable<SlideItem>();

  // current target pieces (first piece at the begining)
  private target: SlideItem;

  /**
   * constructor
   * @param _el base element used for resize handler and threejs hanchor
   * @param _renderer local renderer
   */
  constructor(
    private store: Store<SLIDES_EVENT.SlidesAppState>
  ) {
    /**
     * register to store Slides
     */
    this.slideObservable = this.store.select<SlideItem>('Slide');

    /**
     * load data
     */
    this.load();

    /**
     * register to slide selection, filter on null values
     */
    this.slideObservable
      .filter(item => {
        if (item) {
          return true
        } else {
          return false
        }
      })
      .subscribe((item) => {
        this.onSlideSelection(item);
      });
  }

  /**
   * dispatch slide loading
   * @param name dispatch slide loading
   * @param url 
   * @param position 
   */
  private onSlideSelection(slide: SlideItem): void {
    console.debug('slide', slide);
    this.target = slide;
    console.debug('slide', slide.getSlide());
    this.tree.selection = this.scene.select(slide.getSlide());
  }

  /**
   * dispatch slide loading
   * @param name dispatch slide loading
   * @param url 
   * @param position 
   */
  private dispatchSlideLoading(id: string, name: string, url: string, position: THREE.Vector3, rotation: THREE.Vector3) {
    this.store.dispatch({
      type: SLIDES_EVENT.addOrUpdateSlide,
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
   * select node event handler
   * @param event select node event
   */
  nodeSelect(event) {
    if (event.node.data && event.node.data.constructor) {
      this.msgs = [];
      this.msgs.push({ severity: 'info', summary: 'Node Selected', detail: event.node.data.constructor.name });
      if (event.node.data.constructor.name === "PerspectiveCamera") {
        /**
         * todo handle camera selection
         */
      } else {
        if (event.node.data.mesh && event.node.data.mesh.constructor && event.node.data.mesh.constructor.name === "Mesh") {
          /**
           * send selection event on this slide
           */
          this.store.dispatch({
            type: SLIDES_EVENT.selectSlideItemEvent,
            payload: new SlideEvent().setSlideItem(<SlideItem>event.node.data)
          });
        }
      }
    }
  }

  /**
   * unselect handler
   * @param event
   */
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
