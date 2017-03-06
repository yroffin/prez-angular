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
import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import * as _ from 'lodash';

import { Message, TreeNode, TreeTable } from 'primeng/primeng';
import { LoggerService } from '../../service/logger.service';

class Link {
  private previous: Link;
  private next: Link;

  constructor(private name: string, private mesh: THREE.Mesh) {
  }

  public setLinked(_previous: Link, _next: Link) {
    this.previous = _previous;
    this.next = _next;
  }

  public getMesh() {
    return this.mesh;
  }
  public getPrevious() {
    return this.previous;
  }
  public getNext() {
    return this.next;
  }
}

@Component({
  selector: 'app-prez-3d-canvas',
  templateUrl: './prez-3d-canvas.component.html',
  styleUrls: ['./prez-3d-canvas.component.css']
})
export class Prez3dCanvasComponent implements OnInit, AfterViewInit {

  /**
   * internal threejs members
   */
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private loader: THREE.TextureLoader;

  /**
   * messages
   */
  private msgs: Message[];
  private nodes: TreeNode[] = [];

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private intersects: THREE.Intersection[];
  private selected: THREE.Object3D[];

  // all pieces of this document
  private pieces: Array<Link> = new Array<Link>();

  // current target pieces (first piece at the begining)
  private target: Link;

  /**
   * constructor
   * @param _el base element used for resize handler and threejs hanchor
   * @param _renderer local renderer
   */
  constructor(private _el: ElementRef, private _renderer: Renderer, private _logger: LoggerService) {

  }

  /**
   * host binding
   * call each time div element is resized
   */
  private onResize(): void {
    let three: any = _.find(this._el.nativeElement.children, (element: any) => {
      return element.id === 'threejs';
    });
    this.renderer.setSize(three.clientWidth, 600);
  }

  /**
   * register a node
   * @param name name of this node
   * @param type type (threejs type)
   * @param position threejs position
   * @param rotation threejs rotation
   */
  private addNode(name: string, type: string, position: THREE.Vector3, rotation: THREE.Euler): void {
    let node: TreeNode =
      {
        "data": {
          "id": name,
          "type": type,
          "position": position,
          "rotation": rotation
        },
        "children": []
      };
    this.nodes.push(node);
  }

  /**
   * register new mesh
   * @param mesh the mesh
   */
  private register(name: string, mesh: THREE.Mesh): Link {
    let link = new Link(name, mesh);
    link.setLinked(link, link);
    this.pieces.push(link);
    return link;
  }

  /**
   * register new mesh
   * @param mesh the mesh
   */
  private linkMeshAtTheEnd(name: string, mesh: THREE.Mesh): Link {
    let link = new Link(name, mesh);
    let first: Link = _.first(this.pieces);
    let last: Link = _.last(this.pieces);
    last.setLinked(last.getPrevious(), link)
    link.setLinked(last, _.first(this.pieces));
    this.pieces.push(link);
    first.setLinked(_.last(this.pieces), first.getNext())
    return link;
  }

  ngOnInit() {
    let global = this._renderer.listenGlobal('document', 'mousemove', (event) => {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // calculate objects intersecting the picking ray
      this.intersects = this.raycaster.intersectObjects(this.scene.children);

      this.selected = [];
      for (var i = 0; i < this.intersects.length; i++) {
        this.selected.push(this.intersects[i].object);
        this.intersects[i].object.rotation.x += 0.01;
      }

      this.render();
    })

    this._renderer.listenGlobal('document', 'keydown', (event) => {
      let ctx;
      if (event.code === "ArrowRight") {
        let previous = this.target;
        this.target = this.target.getNext();
        this.goto(previous, this.target);
        this.lookAt(previous, this.target);
      }
      if (event.code === "ArrowLeft") {
        let previous = this.target;
        this.target = this.target.getPrevious();
        this.goto(previous, this.target);
        this.lookAt(previous, this.target);
      }
    });
  }

  private goto(previous: Link, target: Link): TWEEN.Tween {
    let from = Object.assign({}, this.camera.position);
    let to = Object.assign({}, target.getMesh().position);
    to.z += 140;
    let that = this;
    // Place camera on x axis
    return new TWEEN.Tween(from).to(to, 2000)
      .easing(TWEEN.Easing.Quintic.InOut).onUpdate(function () {
        that.camera.position.x = this.x;
        that.camera.position.y = this.y;
        that.camera.position.z = this.z;
        that.render();
      }).onComplete(function () {
        that.camera.position.x = this.x;
        that.camera.position.y = this.y;
        that.camera.position.z = this.z;
        that.render();
      }).start();
  }

  private lookAt(previous: Link, target: Link): TWEEN.Tween {
    let from = Object.assign({}, previous.getMesh().position);
    let to = Object.assign({}, target.getMesh().position);
    let that = this;
    // Place camera on x axis
    return new TWEEN.Tween(from).to(to, 2000)
      .easing(TWEEN.Easing.Quintic.InOut).onUpdate(function () {
        that.camera.lookAt(this);
        that.render();
      }).onComplete(function () {
        that.camera.lookAt(this);
        that.render();
      }).start();
  }

  ngAfterViewInit() {
    this.init();
    this.add("1", { x: 0, y: 0, z: 0 });
    this.add("2", { x: 400, y: 0, z: 0 });
    this.add("3", { x: 400, y: 400, z: 0 });
    this.add("4", { x: 0, y: 400, z: 0 });
    this.add("5", { x: 0, y: 0, z: -1000 });
    this.add("6", { x: 400, y: 0, z: -1000 });
    this.add("7", { x: 400, y: 400, z: -1000 });
    this.add("8", { x: 0, y: 400, z: -1000 });
    this._logger.info("pieces", this.pieces);
    this.run();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private add(name: string, position: any) {
    this._logger.info("add new piece");
    let geometry = new THREE.PlaneBufferGeometry(320, 200);
    let material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    //mesh.position.z = nextPlace.z;
    // register this node
    this.addNode(mesh.name, "Plane", mesh.position, mesh.rotation);
    this.scene.add(mesh);
    // register this new mesh
    if(this.pieces.length == 0) {
      this.target = this.register(name, mesh);
    } else {
      this.linkMeshAtTheEnd(name, mesh);
    }
    this.render();
    this.loader.load('/assets/svg/PLAN_ACCES_HOTEL_KICK_OFF.svg', (texture) => {
      let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      mesh.material.setValues(material);
      this.render();
    });
  }

  private run() {
    setTimeout(() => {
      TWEEN.update();
      this.run();
    }, 1);
  }

  private init() {
    this._logger.info("Init scene");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 1000;
    this.addNode(this.camera.name, "Camera", this.camera.position, this.camera.rotation);
    this.loader = new THREE.TextureLoader();
    this.renderer = new THREE.WebGLRenderer();
    this.onResize();
    document.getElementById("threejs").appendChild(this.renderer.domElement);
  }
}
