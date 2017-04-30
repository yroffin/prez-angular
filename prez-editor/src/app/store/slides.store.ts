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

export const addOrUpdateSlide = 'addOrUpdateSlide';

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

/**
 * main store for this application
 */
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
            if(currentIndex > 0) {
                prev = array[currentIndex - 1];
            }
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
    public static slideReducer(state: Slide = new Slide(), action: Action): Slide {
        switch (action.type) {
            case selectSlideItemEvent:
                /**
                 * select this slide
                 */
                state = <Slide> action.payload;
                state = Object.assign(new Slide(), state);
                return state;

            case selectNextSlideItemEvent:
                state = (<Slide> state).getNext();
                return state;

            case selectPrevSlideItemEvent:
                state = (<Slide> state).getPrevious();
                return state;

            case updateSlidePosX:
                /**
                 * fix slide position
                 */
                state.setPosX(<number>action.payload);
                state = Object.assign(new Slide(), state);
                return state;

            case updateSlidePosY:
                /**
                 * fix slide position
                 */
                state.setPosY(<number>action.payload);
                state = Object.assign(new Slide(), state);
                return state;

            case updateSlidePosZ:
                /**
                 * fix slide position
                 */
                state.setPosZ(<number>action.payload);
                state = Object.assign(new Slide(), state);
                return state;

            case updateSlideRotX:
                /**
                 * fix slide position
                 */
                state.setRotX(<number>action.payload);
                state = Object.assign(new Slide(), state);
                return state;

            case updateSlideRotY:
                /**
                 * fix slide position
                 */
                state.setRotY(<number>action.payload);
                state = Object.assign(new Slide(), state);
                return state;

            case updateSlideRotZ:
                /**
                 * fix slide position
                 */
                state.setRotZ(<number>action.payload);
                state = Object.assign(new Slide(), state);
                return state;

            default:
                return state;
        }
    }
}
