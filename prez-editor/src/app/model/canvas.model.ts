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

import * as THREE from 'three';

export class Scene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private loader: THREE.TextureLoader;
    private canvas: HTMLCanvasElement;
    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    private mouse: THREE.Vector2 = new THREE.Vector2();

    /**
     * build a new scene
     * @param name 
     */
    constructor(name: string) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        this.loader = new THREE.TextureLoader();
        this.canvas = <HTMLCanvasElement>document.getElementById(name);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.renderer.setViewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        /**
         * add default camera
         */
        this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 1, 10000);
        this.camera.name = "default";
        this.camera.position.z = 1000;
    }

    /**
     * find interactions
     * @param event 
     */
    public getIntersections(event: any): THREE.Intersection[] {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this.mouse.x = (event.offsetX / this.getCanvasWidth()) * 2 - 1;
        this.mouse.y = - (event.offsetY / this.getCanvasHeight()) * 2 + 1;

        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.getCamera());

        // calculate objects intersecting the picking ray
        return this.raycaster.intersectObjects(this.scene.children);
    }

    /**
     * render this scene
     */
    public render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * add a new standard mesh
     * @param name 
     * @param x 
     * @param y 
     * @param z 
     * @param url 
     */
    public add(name: string, x: number, y: number, z: number, url: string): THREE.Mesh {
        // create mesh linked to this slide
        let geometry = new THREE.PlaneBufferGeometry(200, 220);
        let material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        // add this element to the current scene
        this.scene.add(mesh);
        // render this scene
        this.render();
        // load url link to this mesh
        this.loader.load(url, (texture) => {
            let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            mesh.material.setValues(material);
            this.render();
        });
        return mesh;
    }

    /**
     * get default camera position
     */
    public setCameraPosition(x: number, y: number, z: number): void {
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = z;
    }

    /**
     * get default camera look at
     */
    public setCameraLookAtPosition(pos: THREE.Vector3): void {
        this.camera.lookAt(pos);
    }

    /**
     * get default camera
     */
    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    /**
     * get default canvas
     */
    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * get default canvas width
     */
    public getCanvasWidth(): number {
        return this.canvas.width;
    }

    /**
     * get default canvas width
     */
    public getCanvasHeight(): number {
        return this.canvas.height;
    }
}
