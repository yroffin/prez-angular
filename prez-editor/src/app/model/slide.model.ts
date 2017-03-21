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

export class Slide {
    private id: string;
    private position: THREE.Vector3;
    private name: string;
    private url: string;
    
    constructor(id?: string, name?: string, url?: string, position?: THREE.Vector3) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.position = position;
    }

    public getPosition(): THREE.Vector3 {
        return this.position;
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
