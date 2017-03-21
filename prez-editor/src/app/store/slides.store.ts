/* 
 * Copyright 2017 Yannick Roffin.
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

import { ActionReducer, Action } from '@ngrx/store';
import * as _ from 'lodash';

import { Slide } from '../model/slide.model';
import { SlideItem } from '../model/slide-item.model';

export const addSlides = 'addSlides';
export const addOrUpdateSlide = 'addOrUpdateSlide';
export const selectSlide = 'selectSlide';

export interface SlidesAppState {
  slides: Array<Slide>;
}

export interface SlideItemAppState {
  item: SlideItem;
}

export class SlidesStore {

    /**
     * slides reducer
     * @param state 
     * @param action 
     */
    public static slidesReducer(state: Array<Slide> = [], action: Action): Array<Slide> {
        switch (action.type) {
            case addSlides:
                return Object.assign(new Array<Slide>(), state, <Array<Slide>> action.payload);

            case addOrUpdateSlide:
                /**
                 * find this slide by index
                 */
                let index = _.findIndex(state, (slide) => {
                    return slide.getId() === (<Slide> action.payload).getId()
                });
                /**
                 * then create it or update it
                 */
                if(index === -1) {
                    return [...state, <Slide> action.payload];
                } else {
                    return state.map((slide) => {
                        let source2: Slide = <Slide> action.payload;
                        return slide.getId() === (<Slide> action.payload).getId() ? Object.assign(new Slide(), slide, source2) : slide;
                    });
                }

            default:
                return state;
        }
    }

    /**
     * single slide reducer
     * @param state
     * @param action 
     */
    public static slideReducer(state: SlideItem, action: Action): SlideItem {
        switch (action.type) {
            case selectSlide:
                return Object.assign(new SlideItem(), state, <SlideItem> action.payload);

            default:
                return state;
        }
    }
}
