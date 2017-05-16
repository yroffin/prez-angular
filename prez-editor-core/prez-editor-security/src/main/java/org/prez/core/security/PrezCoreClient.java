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

import java.util.ArrayList;
import java.util.List;

import org.pac4j.core.client.BaseClient;
import org.pac4j.core.client.ClientType;
import org.pac4j.core.client.DirectClient;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.exception.BadCredentialsException;
import org.pac4j.core.exception.RequiresHttpAction;
import org.prez.model.TechnicalHttpException;

/**
 * simple core client for pac4j
 */
public class PrezCoreClient extends DirectClient<PrezCoreCredentials, PrezCoreProfile> {

	List<Oauth2ApiClient> oauth2ApiClients = new ArrayList<Oauth2ApiClient>();

	@Override
	public PrezCoreCredentials getCredentials(WebContext context) throws RequiresHttpAction {
		PrezCoreCredentials credentials = new PrezCoreCredentials();
		credentials.setClientName("JarvisCoreClient");
		setAuthorizationGenerator(new PrezAuthorization());
		return credentials;
	}

	@Override
	protected BaseClient<PrezCoreCredentials, PrezCoreProfile> newClient() {
		return new PrezCoreClient();
	}

	@Override
	protected PrezCoreProfile retrieveUserProfile(PrezCoreCredentials credentials, WebContext context) {
		logger.info("retrieveUserProfile");

		String token = context.getRequestHeader("JarvisAuthToken");
		if(token == null) {
			logger.error("No token from {}", context.getRemoteAddr());
			throw new BadCredentialsException("No token");
		}

		/**
		 * retrieve token validation
		 */
		try {
			PrezCoreProfile profile = null;
			/**
			 * validate token with all clients
			 */
			for(Oauth2ApiClient oauth2ApiClient : oauth2ApiClients) {
				if(profile != null) continue;
				profile = oauth2ApiClient.getAccessTokenInfo(token);
			}
			if(profile == null) {
				logger.error("No token valid {} from {}", token, context.getRemoteAddr());
				throw new BadCredentialsException("No token type");
			}
			logger.info("retrieveUserProfile profile={}", profile);
			return profile;
		} catch (TechnicalHttpException e) {
			logger.error("Token is not valid {}", e);
			throw new BadCredentialsException("Token is not valid", e);
		} catch (Exception e) {
			logger.error("Token is not valid {}", e);
			throw new BadCredentialsException("Token is not valid", e);
		}
	}

	@Override
	public ClientType getClientType() {
		return ClientType.HEADER_BASED;
	}

	@Override
	protected void internalInit(WebContext context) {
		/**
		 * define google api client to retrieve token
		 * on each call
		 */
		oauth2ApiClients.add(new Oauth2ApiClient("https://www.googleapis.com/oauth2", "access_token", "/v3/tokeninfo"));
		oauth2ApiClients.add(new Oauth2ApiClient("https://graph.facebook.com", "access_token", "/me"));
	}

}