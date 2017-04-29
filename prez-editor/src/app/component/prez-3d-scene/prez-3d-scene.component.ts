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
import { addOrUpdateSlide } from '../../store/slides.store';

import { selectSlideItemEvent } from '../../store/slides.store';
import { Camera } from '../../model/camera.model';
import * as SLIDE from '../../model/slide.model';
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

  // selected by pointer
  private selected: SLIDE.Slide;

  // current target pieces (first piece at the begining)
  private target: SLIDE.Slide;

  // store
  private slidesObservable: Observable<Array<SLIDE.Slide>> = new Observable<Array<SLIDE.Slide>>();
  private slideObservable: Observable<SLIDE.Slide> = new Observable<SLIDE.Slide>();
  private cameraObservable: Observable<Camera> = new Observable<Camera>();

  /**
   * slide registry
   */
  private slidesIndex: Map<string, SLIDE.Slide> = new Map<string, SLIDE.Slide>();

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
    private _store: Store<State<any>>,
    private _canvas: CanvasDataService) {
    /**
     * register to store Slides
     */
    this.slidesObservable = this._store.select<Array<SLIDE.Slide>>('Slides');
    this.slideObservable = this._store.select<SLIDE.Slide>('Slide');
    this.cameraObservable = this._store.select<Camera>('Camera');
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
        this.slidesIndex.forEach((slide) => {
          let focusedMesh = this._canvas.findMeshById("threejs", slide.getMeshId());
          if (focusedMesh.uuid === intersect.object.uuid) {
            slide.setFocused(true);
          }
          // dispatch event
          this._store.dispatch({
            type: addOrUpdateSlide,
            payload: slide
          });
        })
      });
    } else {
      this.slidesIndex.forEach((slide) => {
        slide.setFocused(false);
        // dispatch event
        this._store.dispatch({
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
    this._store.dispatch({
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
    this._store.dispatch({
      type: SLIDES.selectPrevSlideItemEvent
    });
  }

  /**
   * init the view
   */
  private viewInit(): void {
    // init the scene
    this.scene = this._canvas.getScene("threejs");

    // Cf. https://github.com/nicolaspanel/three-orbitcontrols-ts/blob/master/src/index.ts
    this.controls = new OrbitControls(this.scene.getCamera(), this.scene.getCanvas());

    // register to slides store
    this.slidesObservable.subscribe((slides) => {
      _.each(slides, (slide) => {
        if (!this.slidesIndex.has(slide.getId())) {
          this.slidesIndex.set(slide.getId(), slide);
        }

        /**
         * add this a new three node
         */
        // this slide is in the scene and may be focused
        let focusedMesh = this._canvas.findMeshById("threejs", slide.getMeshId());
        let material: THREE.MeshBasicMaterial = <THREE.MeshBasicMaterial>focusedMesh.material;
        if (slide.isFocused()) {
          material.opacity = 0.65;
          material.color.setHex(0xffff00);
          material.transparent = true;
          material.depthWrite = false;
          material.depthTest = false;
          this.selected = slide;
        } else {
          material.opacity = 1.0;
          material.color.setHex(0xffffff);
          material.transparent = false;
          material.depthWrite = true;
          material.depthTest = true;
        }

        /**
         * only first time
         */
        if (this.firstTime) {
          this.target = slide;
          this._store.dispatch({
            type: selectSlideItemEvent,
            payload: slide
          });
          this.firstTime = false;
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
        this.onSlideSelection(item);
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
        if(item["name"]) {
          this.scene.setCameraPosition(item.getPosition().x, item.getPosition().y, item.getPosition().z);
          this.scene.setCameraLookAtPosition(item.getLookAtPosition());
          this.render();
        }
      });
  }

  /**
   * dispatch slide loading
   * @param name dispatch slide loading
   * @param url 
   * @param position 
   */
  private onSlideSelection(item: SLIDE.Slide): void {
    /**
     * find any associated mesh to this slide (by its id)
     */
    let targetMesh = this._canvas.findMeshById("threejs", item.getMeshId());
    if ((this.target.getMeshId() === item.getMeshId())) {
      /**
       * update mesh
       */
      let targetSlide = item;
      targetMesh.position.x = targetSlide.getPosition().x;
      targetMesh.position.y = targetSlide.getPosition().y;
      targetMesh.position.z = targetSlide.getPosition().z;
      targetMesh.rotateX(targetSlide.getRotation().x * Math.PI / 180);
      targetMesh.rotateY(targetSlide.getRotation().y * Math.PI / 180);
      targetMesh.rotateZ(targetSlide.getRotation().z * Math.PI / 180);
      this.render();
    } else {
      let currentMesh = this._canvas.findMeshById("threejs", this.target.getMeshId());
      this.lookAtMesh(currentMesh, targetMesh, () => {
        this.target = item;
        this.scene.setCameraPosition(targetMesh.position.x, targetMesh.position.y, targetMesh.position.z + 140);
        this.scene.setCameraLookAtPosition(targetMesh.position);
        this.render();
      });
    }
  }

  /**
   * render this scene
   */
  public render() {
    this.scene.render();
  }

  /**
   * mouse move event
   * @param event 
   */
  @HostListener('mousemove', ['$event'])
  private handleMousemove(event) {
    this.capture(event);
    this.render();
  }

  /**
   * wheel
   * @param event 
   */
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
    if (this.selected) {
      /**
       * send selection event
       */
      this._store.dispatch({
        type: selectSlideItemEvent,
        payload: this.selected
      });
    }
  }

  /**
   * handle keydown
   * @param event 
   */
  @HostListener('window:keydown', ['$event'])
  private handleKeydown(event) {
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
}
