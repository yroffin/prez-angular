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

export const selectCamera = 'selectCamera';
export const updateCameraPosition = 'updateCameraPosition';
export const updateCameraLookAtPosition = 'updateCameraLookAtPosition';

export interface CamerasAppState {
    cameras: Array<Camera>;
    camera: Camera;
}

export class CamerasStore {

    public static camerasReducer(state: Array<Camera> = [], action: Action): Array<Camera> {
        switch (action.type) {
            case resetCameras:
                return Object.assign(new Array<Camera>(), state, <Array<Camera>>action.payload);

            case addOrUpdateCamera:
                state.push(<Camera>action.payload);
                return state;

            default:
                return state;
        }
    }

    /**
     * single camera reducer (the current camera on with we apply current focus)
     * @param state
     * @param action 
     */
    public static cameraReducer(state: Camera, action: Action): Camera {
        switch (action.type) {
            /**
             * assign current camera on witch we want to apply
             * focus
             */
            case selectCamera:
                {
                    let cam = <Camera>action.payload;
                    state = new Camera(cam.getName(), cam.getPosition(), cam.getLookAtPosition());
                }
                return state

            case updateCameraPosition:
                {
                    let pos = <THREE.Vector3>action.payload
                    state = new Camera(state.getName(), pos, state.getLookAtPosition());
                }
                return state;

            case updateCameraLookAtPosition:
                {
                    let look = <THREE.Vector3>action.payload
                    state = new Camera(state.getName(), state.getPosition(), look);
                }
                return state;

            default:
                return state;
        }
    }

}
