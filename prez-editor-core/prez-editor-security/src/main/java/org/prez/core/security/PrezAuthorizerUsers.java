/**
 *  Copyright 2017 Yannick Roffin
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *   limitations under the License.
 */

package org.prez.core.security;

import org.pac4j.core.authorization.Authorizer;
import org.pac4j.core.context.WebContext;

/**
 * check with user list
 */
public class PrezAuthorizerUsers implements Authorizer<PrezCoreProfile> {

	private String[] users;

	/**
	 * @param users
	 */
	public PrezAuthorizerUsers(String[] users) {
		this.users = users;
	}

	@Override
	public boolean isAuthorized(WebContext context, PrezCoreProfile profile) {
		for(String user : users) {
			if(user.equals(profile.getEmail())) {
				return true;
			}
		}
		return false;
	}

}
