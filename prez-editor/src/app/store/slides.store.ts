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
import { SlideItem, SlideEvent } from '../model/slide-item.model';

export const addOrUpdateSlide = 'addOrUpdateSlide';
export const selectSlide = 'selectSlide';

export const selectSlideItemEvent = 'selectSlideItemEvent';
export const selectNextSlideItemEvent = 'selectNextSlideItemEvent';
export const selectPrevSlideItemEvent = 'selectPrevSlideItemEvent';

export const focusSlide = 'focusSlide';
export const updateSlidePosX = 'updateSlidePosX';
export const updateSlidePosY = 'updateSlidePosY';
export const updateSlidePosZ = 'updateSlidePosZ';
export const updateSlideRotX = 'updateSlideRotX';
export const updateSlideRotY = 'updateSlideRotY';
export const updateSlideRotZ = 'updateSlideRotZ';

export const selectSlideEvent = 'selectSlideEvent';

export interface SlidesAppState {
    slides: Array<Slide>;
}

export interface SlideItemAppState {
    item: SlideItem;
}

export class SlidesStore {

    /**
     * build previous and next
     * @param newState 
     */
    public static reduce(newState: Array<Slide>) {
        // handle first element
        if (newState.length == 1) {
            newState[0].setLinked(newState[0], newState[0]);
        }
        if (newState.length > 1) {
            newState[0].setLinked(newState[newState.length - 1], newState[1]);
        }
        // build next and previous value
        newState.reduce((previousValue, currentValue, currentIndex, array) => {
            let prev = array[array.length - 1];
            let next = null;
            if (currentIndex == (array.length - 1)) {
                next = array[0];
            } else {
                next = array[currentIndex + 1];
            }
            currentValue.setLinked(prev, next);
            return currentValue;
        });
    }

    /**
     * slides reducer
     * @param state 
     * @param action 
     */
    public static slidesReducer(state: Array<Slide> = [], action: Action): Array<Slide> {
        switch (action.type) {
            /**
             * add or update a slide
             */
            case addOrUpdateSlide:
                {
                    /**
                     * find this slide by index
                     */
                    let index = _.findIndex(state, (slide) => {
                        return slide.getId() === (<Slide>action.payload).getId()
                    });
                    /**
                     * then create it or update it
                     */
                    if (index === -1) {
                        let newState = [...state, <Slide>action.payload];
                        SlidesStore.reduce(newState);
                        return newState;
                    } else {
                        // compute new state
                        let newState = state.map((slide) => {
                            let target: Slide = <Slide>action.payload;
                            return slide.getId() === (<Slide>action.payload).getId() ? Object.assign(Slide.factory(), slide, target) : slide;
                        });
                        SlidesStore.reduce(newState);
                        return newState;
                    }
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
                return Object.assign({}, state, <SlideItem>action.payload);

            case selectSlideItemEvent:
                /**
                 * select this slide
                 */
                let slideEvent = <SlideEvent>action.payload;
                let target = <SlideItem>(<SlideEvent>action.payload).getSlideItem();
                return Object.assign(new SlideItem(null, null), state, <SlideItem>(<SlideEvent>action.payload).getSlideItem());

            case selectNextSlideItemEvent:
                return Object.assign(new SlideItem(null, null), state.getNext());

            case selectPrevSlideItemEvent:
                return Object.assign(new SlideItem(null, null), state.getPrevious());

            case updateSlidePosX:
                /**
                 * fix slide position
                 */
                state.getSlide().setPosX(<number>action.payload);
                state.getMesh().position.x = <number>action.payload;
                return state;

            case updateSlidePosY:
                /**
                 * fix slide position
                 */
                state.getSlide().setPosY(<number>action.payload);
                state.getMesh().position.y = <number>action.payload;
                return state;

            case updateSlidePosZ:
                /**
                 * fix slide position
                 */
                state.getSlide().setPosZ(<number>action.payload);
                state.getMesh().position.z = <number>action.payload;
                return state;

            case updateSlideRotX:
                /**
                 * fix slide position
                 */
                state.getSlide().setRotX(<number>action.payload);
                state.getMesh().rotation.x = <number>action.payload * Math.PI / 180;
                return state;

            case updateSlideRotY:
                /**
                 * fix slide position
                 */
                state.getSlide().setRotY(<number>action.payload);
                state.getMesh().rotation.y = <number>action.payload * Math.PI / 180;
                return state;

            case updateSlideRotZ:
                /**
                 * fix slide position
                 */
                state.getSlide().setRotZ(<number>action.payload);
                state.getMesh().rotation.z = <number>action.payload * Math.PI / 180;
                return state;

            default:
                return state;
        }
    }

    /**
     * single slide event reducer
     * @param state
     * @param action 
     */
    public static slideEventReducer(state: SlideEvent, action: Action): SlideEvent {
        switch (action.type) {

            case selectSlideItemEvent:
                return Object.assign(new SlideEvent(), state, <SlideEvent>action.payload);

            case updateSlidePosX:
                return Object.assign(new SlideEvent(), state, <SlideEvent>action.payload);

            case updateSlidePosY:
                return Object.assign(new SlideEvent(), state, <SlideEvent>action.payload);

            case updateSlidePosZ:
                return Object.assign(new SlideEvent(), state, <SlideEvent>action.payload);

            case updateSlideRotX:
                return Object.assign(new SlideEvent(), state, <SlideEvent>action.payload);

            case updateSlideRotY:
                return Object.assign(new SlideEvent(), state, <SlideEvent>action.payload);

            case updateSlideRotZ:
                return Object.assign(new SlideEvent(), state, <SlideEvent>action.payload);

            default:
                return state;
        }
    }
}
