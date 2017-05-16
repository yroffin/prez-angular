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

import java.io.IOException;
import java.util.Map;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.prez.core.AbstractJerseyClient;
import org.prez.model.TechnicalException;
import org.prez.model.TechnicalHttpException;

/**
 * simple oauth2 api client
 */
public class Oauth2ApiClient extends AbstractJerseyClient {

	private String token;
	private String path;

	/**
	 * constructor
	 * @param baseurl 
	 * @param token 
	 * @param path 
	 */
	public Oauth2ApiClient(String baseurl, String token, String path) {
		/**
		 * initialize
		 */
		initialize(
				baseurl,
				null,
				null,
				"2000",
				"2000");

		this.token = token;
		this.path = path;
	}

	/**
	 * @param tokenKey 
	 * @return CommonProfile
	 * @throws TechnicalHttpException
	 */
	public PrezCoreProfile getAccessTokenInfo(String tokenKey) throws TechnicalHttpException {
		Response entity;
		entity = client.target(baseurl)
				.queryParam(token, tokenKey)
		        .path(path)
		        .request(MediaType.APPLICATION_JSON)
		        .accept(MediaType.APPLICATION_JSON)
		        .acceptEncoding("charset=UTF-8")
		        .get();
		
		if(entity.getStatus() == 200) {
			Map<?, ?> body = null;
			try {
				body = mapper.readValue(entity.readEntity(String.class), Map.class);
				/**
				 * google case
				 */
				if(body.get("email_verified") != null && body.get("email_verified").equals("true")) {
					PrezCoreProfile profile = new PrezCoreProfile();
					profile.addAttribute("email", body.get("email"));
					profile.addAttribute("token", tokenKey);
					return profile;
				}
				/**
				 * facebook case
				 */
				if(body.get("name") != null) {
					PrezCoreProfile profile = new PrezCoreProfile();
					profile.addAttribute("name", body.get("name"));
					profile.addAttribute("token", tokenKey);
					return profile;
				}
			} catch (IOException e) {
				throw new TechnicalException(e);
			}
			return null;
		} else {
			throw new TechnicalHttpException(entity.getStatus(), "While retrieving token info");
		}
	}
}