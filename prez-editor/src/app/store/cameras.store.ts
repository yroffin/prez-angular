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

import { Camera } from '../model/camera.model';

export const resetCameras = 'resetCameras';
export const addOrUpdateCamera = 'addOrUpdateCamera';

export interface CamerasAppState {
  slides: Array<Camera>;
}

export class CamerasStore {

    public static camerasReducer(state: Array<Camera> = [], action: Action): Array<Camera> {
        switch (action.type) {
            case resetCameras:
                return Object.assign(new Array<Camera>(), state, <Array<Camera>> action.payload);

            case addOrUpdateCamera:
                state.push(<Camera> action.payload);
                return state;

            default:
                return state;
        }
    }

}
