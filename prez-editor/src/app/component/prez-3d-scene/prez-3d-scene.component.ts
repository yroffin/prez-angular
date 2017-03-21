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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

import * as TWEEN from 'tween.js';
import * as _ from 'lodash';

import { Message, TreeNode, TreeTable } from 'primeng/primeng';

import { Render } from '../../interface/render.interface';

import { LoggerService } from '../../service/logger.service';
import { TweenFactoryService } from '../../service/tween-factory.service';
import { SlidesAppState } from '../../store/slides.store';

import { Slide } from '../../model/slide.model';
import { SlideItem } from '../../model/slide-item.model';

@Component({
  selector: 'app-prez-3d-scene',
  templateUrl: './prez-3d-scene.component.html',
  styleUrls: ['./prez-3d-scene.component.css']
})
export class Prez3dSceneComponent implements OnInit {

  /**
   * internal threejs members
   */
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private loader: THREE.TextureLoader;
  private canvas: HTMLCanvasElement;

  /**
   * internal
   */
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

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private intersects: THREE.Intersection[];

  // all pieces of this document
  private pieces: Array<SlideItem> = new Array<SlideItem>();

  // current target pieces (first piece at the begining)
  private target: SlideItem;

  // selected by pointer
  private selected: any = {};

  // store
  private slides: Observable<Array<Slide>> = new Observable<Array<Slide>>();
  private slide: Observable<SlideItem> = new Observable<SlideItem>();

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
    private store: Store<SlidesAppState>) {
    /**
     * register to store Slides
     */
    this.slides = this.store.select('Slides');
    this.slide = this.store.select('Slide');

    // load the scene
    this.slide.subscribe((item) => {
      if(!item.isEmpty()) {
        let current = this.target;
        if(current === undefined) {
          current = item;
        }
        this.target = item;
        this._logger.info("SELECT/slide", current, this.target);
        this.lookAtMesh(current.getMesh(), item.getMesh());
      }
    });
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

  @HostListener('dblclick', ['$event'])
  private handleDblclick(event) {
    console.log(event, this.selected);
    if (this.selected && this.selected.piece) {
      // this._factory.goto(this.camera, this, this.target, this.selected.piece, 140);
      // this._factory.lookAt(this.camera, this, this.target, this.selected.piece);
    }
  }

  @HostListener('keydown', ['$event'])
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
  private addMesh(slide: Slide, mesh: THREE.Mesh): void {
    let node: TreeNode =
      {
        "label": mesh.name,
        "icon": "fa-file-word-o",
        "data": new SlideItem(slide, mesh),
        "children": []
      };
    this.nodesMesh.push(node);
  }

  /**
   * register new mesh
   * @param mesh the mesh
   */
  private register(slide: Slide, mesh: THREE.Mesh): SlideItem {
    let link = new SlideItem(slide, mesh);
    link.setLinked(link, link);
    this.pieces.push(link);
    return link;
  }

  /**
   * register new mesh
   * @param mesh the mesh
   */
  private linkMeshAtTheEnd(slide: Slide, mesh: THREE.Mesh): SlideItem {
    let link = new SlideItem(slide, mesh);
    let first: SlideItem = _.first(this.pieces);
    let last: SlideItem = _.last(this.pieces);
    last.setLinked(last.getPrevious(), link)
    link.setLinked(last, _.first(this.pieces));
    this.pieces.push(link);
    first.setLinked(_.last(this.pieces), first.getNext())
    return link;
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
    this.run();
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
    if (this.selected && this.selected.piece) {
      let previous = this.selected.piece;
      this.target = this.selected.piece;
      // this._factory.goto(this.camera, this, previous, this.target, 140);
      // this._factory.lookAt(this.camera, this, previous, this.target);
    }
  }

  /**
   * capture selection
   */
  private capture(event: any): void {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    this.mouse.x = (event.offsetX / this.canvas.width) * 2 - 1;
    this.mouse.y = - (event.offsetY / this.canvas.height) * 2 + 1;

    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // calculate objects intersecting the picking ray
    this.intersects = this.raycaster.intersectObjects(this.scene.children);

    // object is selected
    if (this.intersects.length > 0) {
      this.selected.uuid = this.intersects[0].object.uuid;
      this.selected.piece = _.find(this.pieces, (piece) => {
        return piece.getMesh().uuid === this.selected.uuid;
      })
    } else {
      this.selected.uuid = null;
    }
  }

  /**
   * next slide
   */
  private next(event: any): void {
    let current = this.target;
    this.target = this.target.getNext();
    this.lookAtMesh(current.getMesh(), this.target.getMesh());
  }

  /**
   * focus on this mesh
   * @param current
   * @param target 
   */
  private lookAtMesh(current: THREE.Mesh, target: THREE.Mesh): void {
    this._factory.goto(this.camera, this, current, target, 140);
    this._factory.lookAt(this.camera, this, current, target);
  }

  /**
   * previous slide
   */
  private previous(event: any): void {
    let previous = this.target;
    this.target = this.target.getPrevious();
    // this._factory.goto(this.camera, this, previous, this.target, 140);
    // this._factory.lookAt(this.camera, this, previous, this.target);
  }

  private controls: OrbitControls;

  /**
   * init the view
   */
  private viewInit(): void {
    // init the scene
    this._logger.info("Init scene");
    this.scene = new THREE.Scene();
    this.loader = new THREE.TextureLoader();
    this.canvas = <HTMLCanvasElement>document.getElementById('threejs');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.renderer.setViewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 1, 10000);
    this.camera.name = "default";
    this.camera.position.z = 1000;
    this.addCamera(this.camera);

    // Cf. https://github.com/nicolaspanel/three-orbitcontrols-ts/blob/master/src/index.ts
    this.controls = new OrbitControls(this.camera, this.canvas);

    // load the scene
    this.slides.subscribe((slides) => {
      this._logger.info("Add some new slides", slides);
      _.each(slides, (slide) => {
        // assert this slide is not associate with a mesh
        let index = _.findIndex(this.nodesMesh, (mesh) => {
          return mesh.data.slide.getId() == slide.getId();
        });
        if(index === -1) {
          this.add(slide);
        }
      });
      this._logger.info("pieces", this.pieces);
    });
  }

  /**
   * render this scene
   */
  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * add a new slide
   * @param name 
   * @param position 
   */
  private add(slide: Slide) {
    this._logger.info("add new piece");
    let geometry = new THREE.PlaneBufferGeometry(200, 220);
    let material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = slide.getName();
    mesh.position.x = slide.getPosition().x;
    mesh.position.y = slide.getPosition().y;
    mesh.position.z = slide.getPosition().z;
    // register this node
    this.addMesh(slide, mesh);
    this.scene.add(mesh);
    // register this new mesh
    if (this.pieces.length == 0) {
      this.target = this.register(slide, mesh);
    } else {
      this.linkMeshAtTheEnd(slide, mesh);
    }
    this.render();
    this.loader.load(slide.getUrl(), (texture) => {
      let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      mesh.material.setValues(material);
      this.render();
    });
  }

  /**
     * calback runner
     */
  private run() {
    setTimeout(() => {
      TWEEN.update();
      this.run();
    }, 1);
  }
}
