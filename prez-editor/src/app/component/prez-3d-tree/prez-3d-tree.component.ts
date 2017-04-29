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
import { ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';

import { Store, State } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as THREE from 'three';

import * as _ from 'lodash';

import { Message, Tree, TreeNode, TreeTable } from 'primeng/primeng';

import * as SLIDES from '../../store/slides.store';
import * as CAMERAS from '../../store/cameras.store';

import * as CANVAS from '../../model/canvas.model'
import * as SLIDE from '../../model/slide.model';

import { CanvasDataService } from '../../service/canvas-data.service';
import { LoggerService } from '../../service/logger.service';

@Component({
  selector: 'app-prez-3d-tree',
  templateUrl: './prez-3d-tree.component.html',
  styleUrls: ['./prez-3d-tree.component.css']
})
export class Prez3dTreeComponent implements OnInit {

  /**
   * link to html template
   */
  @ViewChild(Tree) tree: Tree
  private msgs: Message[];

  /**
   * store members
   */
  private slidesObservable: Observable<Array<SLIDE.Slide>> = new Observable<Array<SLIDE.Slide>>();
  private slideObservable: Observable<SLIDE.Slide> = new Observable<SLIDE.Slide>();

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

  constructor(
    private _logger: LoggerService,
    private _store: Store<State<any>>,
    private _canvas: CanvasDataService) {
    /**
     * register to store Slides
     */
    this.slidesObservable = this._store.select<Array<SLIDE.Slide>>('Slides');
    this.slideObservable = this._store.select<SLIDE.Slide>('Slide');

    /**
     * register to slides list modification
     */
    this.slidesObservable
      .filter(item => {
        if (item) {
          return true
        } else {
          return false
        }
      })
      .subscribe((items) => {
        this.onSlidesSelection(items);
      });

    /**
     * register to slide selection
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
   * init
   */
  ngOnInit() {
  }

  /**
   * view init
   */
  ngAfterViewInit() {
    this.viewInit();
  }

  /**
   * init the view
   */
  private viewInit(): void {
    // init the scene
    let scene = this._canvas.getScene("threejs");
    this.addCamera(scene.getCamera());
  }

  /**
   * dispatch slide loading
   */
  private onSlidesSelection(slides: Array<SLIDE.Slide>): void {
    _.each(slides, (slide) => {
      let found: SLIDE.Slide = null;
      _.each(this.nodesMesh, (mesh) => {
        if ((<SLIDE.Slide>mesh.data).getMeshId() === slide.getMeshId()) {
          found = slide;
        }
      });
      /**
       * if this slide is not loaded add it to tree node
       */
      if (found === null) {
        this._logger.info("Prez3dTreeComponent::onSlidesSelection", slide);
        this.addMesh(slide);
      }
    });
  }

  /**
   * dispatch slide loading
   */
  private onSlideSelection(slide: SLIDE.Slide): void {
    _.each(this.nodesMesh, (node) => {
      if ((<SLIDE.Slide>node.data).getId() === slide.getId()) {
        this.tree.selection = node;
      }
    });
  }

  /**
   * select node event handler
   * @param event select node event
   */
  nodeSelect(event) {
    if (event.node.data && event.node.data.constructor) {
      this.msgs = [];
      if (event.node.data.constructor.name === "PerspectiveCamera") {
        /**
         * todo handle camera selection
         */
      } else {
        if (event.node.data.meshId) {
          this.msgs.push({ severity: 'info', summary: 'Mesh Selected', detail: event.node.data.meshId });
          /**
           * send selection event on this slide
           */
          this._store.dispatch({
            type: SLIDES.selectSlideItemEvent,
            payload: <SLIDE.Slide>event.node.data
          });
        }
      }
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
   * register a slide
   * @param slide to add
   */
  private addMesh(slide: SLIDE.Slide): void {
    let node: TreeNode =
      {
        "label": slide.getName(),
        "icon": "fa-file-word-o",
        "data": slide,
        "children": []
      };
    this.nodesMesh.push(node);
  }
}

