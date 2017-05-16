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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import spark.Filter;
import spark.Request;
import spark.Response;

/**
 * basic filter for token validation
 */
public class PrezAccessLogFilter implements Filter {
	
	protected final Logger logger = LoggerFactory.getLogger(getClass());

	@Override
	public void handle(Request request, Response response) throws Exception {
		int length = 0;
		if(response.body() != null) length = response.body().length();
		logger.warn("{} {} {} {} {} {} {}", request.ip(), request.contentLength(), request.requestMethod(), request.url(), request.protocol(), response.status(), length);
	}

}
