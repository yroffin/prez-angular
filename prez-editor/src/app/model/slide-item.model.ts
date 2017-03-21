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
import { Slide } from './slide.model';

export class SlideItem {
    private previous: SlideItem;
    private next: SlideItem;
    private slide: Slide;
    private mesh: THREE.Mesh;

    constructor(slide?: Slide, mesh?: THREE.Mesh) {
        this.slide = slide;
        this.mesh = mesh;
    }

    public getSlide(): Slide {
        return this.slide;
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public getUuid(): string {
        return this.mesh.uuid;
    }

    public setLinked(_previous: SlideItem, _next: SlideItem) {
        this.previous = _previous;
        this.next = _next;
    }

    public getPrevious() {
        return this.previous;
    }

    public getNext() {
        return this.next;
    }

    public isEmpty(): boolean {
        return !((this.mesh) && (this.slide));
    }
}
