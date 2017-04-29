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

import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as CANVAS from '../model/canvas.model'
import * as SLIDE from '../model/slide.model'
import * as THREE from 'three';

import { LoggerService } from '../service/logger.service';

@Injectable()
export class CanvasDataService {

  /**
   * internal members
   */
  private scenes = new Map<string, CANVAS.Scene>();

  /**
   * constructor
   */
  constructor(
    private _logger: LoggerService,
  ) {
  }

  /**
   * allocate (or get) a new scene
   * @param name
   */
  public getScene(name: string): CANVAS.Scene {
    if (!this.scenes.has(name)) {
      this.scenes.set(name, new CANVAS.Scene(name));
    }
    return this.scenes.get(name);
  }

  /**
   * reteirve items
   * @param name
   */
  public findMeshById(name: string, meshId: number): THREE.Mesh {
    let scene = this.scenes.get(name);
    if(scene === null) {
      this._logger.error("findMeshById scene is null for", name);
    }
    let mesh: THREE.Mesh = scene.findMeshById(meshId);
    return mesh;
  }

  /**
   * associate a slide to a mesh (created)
   * @param name 
   * @param slide 
   */
  public createMeshFromSlide(name: string, slide: SLIDE.Slide): THREE.Mesh {
    /**
     * create a new mesh with slide data
     */
    let mesh = this.getScene(name).add(slide.getName(), slide.getPosition().x, slide.getPosition().y, slide.getPosition().z, slide.getUrl());
    return mesh;
  }
}
