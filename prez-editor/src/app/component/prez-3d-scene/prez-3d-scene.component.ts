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
import { HostBinding, HostListener, ElementRef } from '@angular/core';
import { AfterViewInit, OnInit } from '@angular/core';
import { Store, State } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/filter';
import { Subject } from 'rxjs/Subject';

import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

import * as TWEEN from 'tween.js';
import * as _ from 'lodash';

import { Message, TreeNode, TreeTable } from 'primeng/primeng';

import { Render } from '../../interface/render.interface';
import * as SLIDES from '../../store/slides.store';
import * as CAMERAS from '../../store/cameras.store';

import { CanvasDataService } from '../../service/canvas-data.service';
import { LoggerService } from '../../service/logger.service';
import { TweenFactoryService } from '../../service/tween-factory.service';
import { SlidesAppState, addOrUpdateSlide } from '../../store/slides.store';

import { selectSlideItemEvent } from '../../store/slides.store';
import { Camera } from '../../model/camera.model';
import { Slide } from '../../model/slide.model';
import { SlideItem, SlideEvent } from '../../model/slide-item.model';
import * as CANVAS from '../../model/canvas.model'

@Component({
  selector: 'app-prez-3d-scene',
  templateUrl: './prez-3d-scene.component.html',
  styleUrls: ['./prez-3d-scene.component.css']
})
export class Prez3dSceneComponent implements OnInit {

  /**
   * internal
   */
  private scene: CANVAS.Scene;
  private nodesCamera: TreeNode[] = [];
  private nodesMesh: TreeNode[] = [];
  private elements: TreeNode[] = [
    {
      "label": "Camera(s)",
      "expandedIcon": "fa-folder-open",
      "collapsedIcon": "fa-folder",
      "children": this.nodesCamera
    },
    {
      "label": "Mesh(s)",
      "expandedIcon": "fa-folder-open",
      "collapsedIcon": "fa-folder",
      "children": this.nodesMesh
    }
  ];

  // selected by pointer
  private selected: SlideItem;

  // current target pieces (first piece at the begining)
  private target: SlideItem;

  // store
  private slidesObservable: Observable<Array<Slide>> = new Observable<Array<Slide>>();
  private slideObservable: Observable<SlideItem> = new Observable<SlideItem>();
  private cameraObservable: Observable<Camera> = new Observable<Camera>();

  private controls: OrbitControls;
  private firstTime: boolean = true;

  /**
   * constructor
   * @param _el 
   * @param _renderer 
   * @param _factory 
   * @param _logger 
   * @param store 
   */
  constructor(
    private _el: ElementRef,
    private _renderer: Renderer,
    private _factory: TweenFactoryService,
    private _logger: LoggerService,
    private store: Store<SlidesAppState>,
    private canvas: CanvasDataService) {
    /**
     * register to store Slides
     */
    this.slidesObservable = this.store.select<Array<Slide>>('Slides');
    this.slideObservable = this.store.select<SlideItem>('Slide');
    this.cameraObservable = this.store.select<Camera>('Camera');
  }

  @HostListener('mousemove', ['$event'])
  private handleMousemove(event) {
    this.capture(event);
    this.render();
  }

  @HostListener('wheel', ['$event'])
  private handleWheel(event) {
    this.render();
  }

  /**
   * handle dblclick event
   * @param event 
   */
  @HostListener('dblclick', ['$event'])
  private handleDblclick(event) {
    this._logger.info("dblclick", event);
    if (this.selected) {
      /**
       * send selection event
       */
      this.store.dispatch({
        type: selectSlideItemEvent,
        payload: new SlideEvent().setSlideItem(this.selected)
      });
    }
  }

  @HostListener('window:keydown', ['$event'])
  private handleKeydown(event) {
    console.info(event);
    if (event.key === "z") {
      this.reset(-10);
      return;
    }
    if (event.key === "s") {
      this.reset(10);
      return;
    }
    if (event.code === "ArrowRight") {
      this.next(event);
      return;
    }
    if (event.code === "ArrowLeft") {
      this.previous(event);
      return;
    }
  }

  /**
   * register a camera
   * @param name name of this node
   * @param type type (threejs type)
   * @param position threejs position
   * @param rotation threejs rotation
   */
  private addCamera(camera: THREE.PerspectiveCamera): void {
    let node: TreeNode =
      {
        "label": camera.name,
        "icon": "fa-file-word-o",
        "data": camera,
        "children": []
      };
    this.nodesCamera.push(node);
  }

  /**
   * register a mesh
   * @param name name of this node
   * @param type type (threejs type)
   * @param position threejs position
   * @param rotation threejs rotation
   */
  private addMesh(slide: SlideItem): SlideItem {
    let node: TreeNode =
      {
        "label": slide.getSlide().getName(),
        "icon": "fa-file-word-o",
        "data": slide,
        "children": []
      };
    this.nodesMesh.push(node);
    return slide;
  }

  /**
   * init component
   */
  ngOnInit() {
    this.componentInit();
  }

  /**
   * view init
   */
  ngAfterViewInit() {
    this.viewInit();
  }

  /**
   * component init
   */
  private componentInit(): void {
  }

  /**
   * reset selection
   */
  private reset(zoom: number): void {
  }

  /**
   * capture selection
   */
  private capture(event: any): void {
    // calculate objects intersecting the picking ray
    let intersects = this.scene.getIntersections(event);

    // dispatch selected event
    if (intersects.length > 0) {
      _.each(intersects, (intersect) => {
        _.each(this.nodesMesh, (mesh) => {
          let slide = mesh.data.getSlide();
          if (mesh.data.getMesh().uuid === intersect.object.uuid) {
            slide.setFocused(true);
          }
          // dispatch event
          this.store.dispatch({
            type: addOrUpdateSlide,
            payload: slide
          });
        })
      });
    } else {
      _.each(this.nodesMesh, (mesh) => {
        let slide = mesh.data.getSlide();
        slide.setFocused(false);
        // dispatch event
        this.store.dispatch({
          type: addOrUpdateSlide,
          payload: slide
        });
      });
    }
  }

  /**
   * next slide
   */
  private next(event: any): void {
    this.store.dispatch({
      type: SLIDES.selectNextSlideItemEvent
    });
  }

  /**
   * focus on this mesh
   * @param current
   * @param target 
   */
  private lookAtMesh(current: THREE.Mesh, target: THREE.Mesh, callback: any): void {
    if (current.id === target.id) return;

    this._factory.lookAt(this.scene.getCamera(), current, target, () => {
      this._logger.debug("lookAt done");
      callback();
    }).start()

    this._factory.goto(this.scene.getCamera(), current, target, 140, () => {
      this._logger.debug("goto done");
      callback();
    }).start()
  }

  /**
   * previous slide
   */
  private previous(event: any): void {
    this.store.dispatch({
      type: SLIDES.selectPrevSlideItemEvent
    });
  }

  /**
   * init the view
   */
  private viewInit(): void {
    // init the scene
    this.scene = this.canvas.getScene("threejs");
    this.addCamera(this.scene.getCamera());

    // Cf. https://github.com/nicolaspanel/three-orbitcontrols-ts/blob/master/src/index.ts
    this.controls = new OrbitControls(this.scene.getCamera(), this.scene.getCanvas());

    // register to slides store
    this.slidesObservable.subscribe((slides) => {
      _.each(slides, (slide) => {
        // assert this slide is not associate with a mesh
        let index = this.canvas.findSlideById("threejs", slide);
        if (index === -1) {
          // this slide is not in the scene
          let item = this.canvas.registerSlide("threejs", slide);
          this.addMesh(item);

          /**
           * only first time
           */
          if (this.firstTime) {
            this.target = item;
            this.store.dispatch({
              type: selectSlideItemEvent,
              payload: new SlideEvent().setSlideItem(this.target)
            });
            this.firstTime = false;
          }
        } else {
          // this slide is in the scene and may be focused
          let focused: SlideItem = this.nodesMesh[index].data;
          if (slide.isFocused()) {
            let material: THREE.MeshBasicMaterial = <THREE.MeshBasicMaterial>focused.getMesh().material;
            material.opacity = 0.65;
            material.color.setHex(0xffff00);
            material.transparent = true;
            material.depthWrite = false;
            material.depthTest = false;
            this.selected = focused;
          } else {
            let material: THREE.MeshBasicMaterial = <THREE.MeshBasicMaterial>focused.getMesh().material;
            material.opacity = 1.0;
            material.color.setHex(0xffffff);
            material.transparent = false;
            material.depthWrite = true;
            material.depthTest = true;
          }
        }
      });
    });

    // register to slide selection
    this.slideObservable
      .filter(item => {
        if (item) {
          return true
        } else {
          return false
        }
      })
      .subscribe((item) => {
        this.lookAtMesh(this.target.getMesh(), item.getMesh(), () => {
          this.target = item;
          this.scene.setCameraPosition(this.target.getMesh().position.x, this.target.getMesh().position.y, this.target.getMesh().position.z + 140);
          this.scene.setCameraLookAtPosition(this.target.getMesh().position);
          this.render();
        });
      });

    // register to camera change
    this.cameraObservable
      .filter(item => {
        if (item) {
          return true
        } else {
          return false
        }
      })
      .subscribe((item) => {
        this.scene.setCameraPosition(item.getPosition().x, item.getPosition().y, item.getPosition().z);
        this.scene.setCameraLookAtPosition(item.getLookAtPosition());
        this.render();
      });
  }

  /**
   * render this scene
   */
  public render() {
    this.scene.render();
  }
}
