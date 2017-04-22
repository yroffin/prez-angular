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

export class Slide {
    private id: string;
    private position: THREE.Vector3;
    private rotation: THREE.Vector3;
    private name: string;
    private url: string;
    private focused: boolean;

    /**
     * for navigation
     */
    private previous: Slide;
    private next: Slide;

    
    /**
     * constructor
     * @param id 
     * @param name 
     * @param url 
     * @param position 
     * @param rotation 
     */
    constructor(id: string, name: string, url: string, position: THREE.Vector3, rotation: THREE.Vector3) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.position = position;
        this.rotation = rotation;
    }

    /**
     * create linked slide
     * @param _previous
     * @param _next 
     */
    public setLinked(_previous: Slide, _next: Slide) {
        this.previous = _previous;
        this.next = _next;
    }

    /**
     * get previous
     */
    public getPrevious() {
        return this.previous;
    }

    /**
     * get next
     */
    public getNext() {
        return this.next;
    }

    public static factory(): Slide {
        return new Slide('','','', new THREE.Vector3(), new THREE.Vector3());
    }

    public setFocused(value: boolean): void {
        this.focused = value;
    }

    public isFocused(): boolean {
        return this.focused === true;
    }

    public setRotX(value: number) {
        this.rotation.x = value;
    }

    public setRotY(value: number) {
        this.rotation.y = value;
    }
    public setRotZ(value: number) {
        this.rotation.z = value;
    }

    public setPosX(value: number) {
        this.position.x = value;
    }
    public setPosY(value: number) {
        this.position.y = value;
    }
    public setPosZ(value: number) {
        this.position.z = value;
    }

    public getPosition(): THREE.Vector3 {
        return this.position;
    }
    public getRotation(): THREE.Vector3 {
        return this.rotation;
    }
    public getName(): string {
        return this.name;
    }
    public getUrl(): string {
        return this.url;
    }
    public getId(): string {
        return this.id;
    }
}
