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
import * as ITEM from '../model/slide-item.model'
import * as SLIDE from '../model/slide.model'

@Injectable()
export class CanvasDataService {

  /**
   * internal members
   */
  private scenes = new Map<string, CANVAS.Scene>();
  private slideItems = new Map<string, Array<ITEM.SlideItem>>();

  /**
   * constructor
   */
  constructor() {
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
   * find slide by id
   * @param name
   * @param slide 
   */
  public findSlideById(name: string, slide: SLIDE.Slide): number {
    if (!this.slideItems.has(name)) {
      this.slideItems.set(name, new Array<ITEM.SlideItem>());
    }
    let slideItems = this.slideItems.get(name);
    // assert this slide is not associate with a mesh
    let index = _.findIndex(slideItems, (slideItem) => {
      return slideItem.getSlide().getId() == slide.getId();
    });
    return index;
  }

  /**
   * associate a slide to a mesh
   * @param name
   * @param slide
   * @param mesh
   */
  public registerSlide(name: string, slide: SLIDE.Slide): ITEM.SlideItem {
    // assert this slide is not associate with a mesh
    let index = this.findSlideById(name, slide);
    if (index === -1) {
      let slideItems = this.slideItems.get(name);
      // slide is not registered
      let mesh = this.getScene(name).add(slide.getName(), slide.getPosition().x, slide.getPosition().y, slide.getPosition().z, slide.getUrl());
      let link = new ITEM.SlideItem(slide, mesh);
      slideItems.push(link);
      // compute next and previous
      this.reduce(slideItems);
      return link;
    }
    // return this slide item
    return this.slideItems.get(name)[index];
  }

  /**
   * build previous and next
   * @param newState 
   */
  private reduce(newState: Array<ITEM.SlideItem>): void {
    // handle first element
    if (newState.length == 1) {
      newState[0].setLinked(newState[0], newState[0]);
    }
    if (newState.length > 1) {
      newState[0].setLinked(newState[newState.length - 1], newState[1]);
    }
    // build next and previous value
    newState.reduce((previousValue, currentValue, currentIndex, array) => {
      let prev = currentIndex - 1;
      if (prev < 0) {
        prev = array.length - 1;
      }
      let next = null;
      if (currentIndex == (array.length - 1)) {
        next = array[0];
      } else {
        next = array[currentIndex + 1];
      }
      currentValue.setLinked(array[prev], next);
      return currentValue;
    });
  }

  /**
   * get slide by id
   * @param id 
   */
  public getSlideById(id: string): SLIDE.Slide {
    if (this.slides.has(id)) {
      return this.slides.get(id);
    }
    return null;
  }

  /**
   * add or update slide
   * @param id 
   * @param name 
   * @param url 
   * @param position 
   * @param rotation 
   */
  public addOrUpdateSlide(id: string, name: string, url: string, position: THREE.Vector3, rotation: THREE.Vector3): SLIDE.Slide {
    if (!this.slides.has(name)) {
      this.slides.set(id, new SLIDE.Slide(id, name, url, position, rotation));
    } else {
      let slide = this.slides.get(id)
      slide.setPosX(position.x)
      slide.setPosY(position.y)
      slide.setPosZ(position.z)
      slide.setRotX(rotation.x);
      slide.setRotY(rotation.y);
      slide.setRotZ(rotation.z);
    }
    return this.slides.get(id);
  }
}
