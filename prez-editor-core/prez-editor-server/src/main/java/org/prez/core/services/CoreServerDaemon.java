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

package org.prez.core.services;

import java.util.Set;

import javax.annotation.PostConstruct;

import org.pac4j.core.client.Clients;
import org.pac4j.core.config.Config;
import org.pac4j.core.profile.UserProfile;
import org.pac4j.sparkjava.DefaultHttpActionAdapter;
import org.prez.core.OrientDBEmbeddable;
import org.prez.core.SwaggerParser;
import org.prez.core.resources.CoreResources;
import org.prez.core.security.PrezAccessLogFilter;
import org.prez.core.security.PrezAuthorizerUsers;
import org.prez.core.security.PrezCoreClient;
import org.prez.core.security.PrezTokenValidationFilter;
import org.reflections.Reflections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableList;

import io.swagger.annotations.Api;
import io.swagger.annotations.Contact;
import io.swagger.annotations.Info;
import io.swagger.annotations.SwaggerDefinition;
import io.swagger.annotations.Tag;
import prez.core.model.bean.config.Oauth2Config;
import spark.Request;
import spark.Response;
import spark.Route;

/**
 * main daemon
 */
@Component
@PropertySources({
	@PropertySource(value = "classpath:server.properties", ignoreResourceNotFound = true),
	@PropertySource(value = "file://${jarvis.user.dir}/config.properties", ignoreResourceNotFound = true)
})
@SwaggerDefinition(host = "192.168.1.12:8082",
info = @Info(
		description = "Jarvis",
		version = "v1.0", //
		title = "Jarvis core system",
		contact = @Contact(
				name = "Yannick Roffin", url = "https://yroffin.github.io"
		)
),
schemes = { SwaggerDefinition.Scheme.HTTP, SwaggerDefinition.Scheme.HTTPS },
consumes = { "application/json" },
produces = { "application/json" },
tags = { @Tag(name = "swagger") }
)
public class CoreServerDaemon {
	protected Logger logger = LoggerFactory.getLogger(CoreServerDaemon.class);

	@SuppressWarnings("unused")
	@Autowired private ApplicationContext applicationContext;
	
	@Autowired
	Environment env;

	@Autowired
	CoreResources coreResources;

	@Autowired
	OrientDBEmbeddable orientDBEmbeddable;
	
	protected ObjectMapper mapper = new ObjectMapper();
	
	/**
	 * start component
	 */
	@PostConstruct
	public void server() {
		
		for(String key : ImmutableList.of(
				"prez-editor.user.dir",
				"prez-editor.log.dir")) {
			logger.info("{} = {}", key, env.getProperty(key));
		}
		
		String iface = env.getProperty("jarvis.server.interface","0.0.0.0");
		int port = Integer.parseInt(env.getProperty("prez-editor.server.port","80"));
		spark.Spark.ipAddress(iface);
		spark.Spark.port(port);
		spark.Spark.threadPool(Integer.parseInt(env.getProperty("prez-editor.server.pool.thread","32")));
		
		/**
		 * port
		 */
		spark.Spark.port(port);

		/**
		 * mount resources
		 */
		if(System.getProperty("profile") != null && System.getProperty("profile").equals("dev")) {
			coreResources.mountLocal();
			spark.Spark.staticFiles.expireTime(1);
		} else {
			coreResources.mountExternal();
			spark.Spark.staticFiles.expireTime(1);
		}
		
		/**
		 * build security config
		 */
		final Clients clients = new Clients(new PrezCoreClient());
		final Config config = new Config(clients);
		final String[] users = env.getProperty("jarvis.oauth2.users","empty").split(",");
		config.addAuthorizer("usersCheck", new PrezAuthorizerUsers(users));
		config.setHttpActionAdapter(new DefaultHttpActionAdapter());
		
		/**
		 * all api must be validated with token
		 */
		final String[] excludes = env.getProperty("jarvis.oauth2.excludes","").split(",");
		spark.Spark.before("/api/*", new PrezTokenValidationFilter(config, "JarvisCoreClient", "securityHeaders,csrfToken,usersCheck", excludes));
		
		/**
		 * ident api
		 */
		spark.Spark.get("/api/profile/me", new Route() {
		    @Override
			public Object handle(Request request, Response response) throws Exception {
		    	/**
		    	 * in exclude mode return a fake profile
		    	 */
		        for(String exclude : excludes) {
		        	if(request.ip().matches(exclude)) {
		                return "{\"attributes\":{\"email\":\"-\"}}";
		        	}
		        }

		        UserProfile userProfile = request.session().attribute("pac4jUserProfile");
				return mapper.writeValueAsString(userProfile);
		    }
		});

		/**
		 * retrieve if credential are needed
		 */
		spark.Spark.get("/api/connect", new Route() {
			@Override
			public Object handle(Request request, Response response) throws Exception {
		        /**
		         * no protection on excluded ips
		         */
		        for(String exclude : excludes) {
		        	if(request.ip().matches(exclude)) {
		                return false;
		        	}
		        }
		        return true;
			}			
		});

		/**
		 * retrieve oauth2 client and identity
		 */
		spark.Spark.get("/api/oauth2", new Route() {
			@Override
			public Object handle(Request request, Response response) throws Exception {
		    	Oauth2Config oauth2Config = new Oauth2Config();
		    	if(request.queryParamsValues("client")[0].equals("google")) {
			    	oauth2Config.type = "google";
			    	oauth2Config.redirect = request.queryParamsValues("oauth2_redirect_uri")[0];
			    	oauth2Config.key = env.getProperty("jarvis.oauth2.google");
			    	oauth2Config.url = "https://accounts.google.com/o/oauth2/auth?scope=email&client_id="+oauth2Config.key+"&response_type=token&redirect_uri="+oauth2Config.redirect;
		    	}
		    	if(request.queryParamsValues("client")[0].equals("facebook")) {
			    	oauth2Config.type = "facebook";
			    	oauth2Config.redirect = request.queryParamsValues("oauth2_redirect_uri")[0];
			    	oauth2Config.key = env.getProperty("jarvis.oauth2.facebook");
			    	oauth2Config.url = "https://www.facebook.com/dialog/oauth?scope=email&client_id="+oauth2Config.key+"&response_type=token&redirect_uri="+oauth2Config.redirect;
		    	}
				return mapper.writeValueAsString(oauth2Config);
		    }
		});

		/**
		 * mount all standard resources
		 */
		mountAllResources("org.jarvis.core.resources.api");

		/**
		 * Build swagger json description
		 */
		final String swaggerJson;
		swaggerJson = SwaggerParser.getSwaggerJson("org.prez.core");
		spark.Spark.get("/api/swagger", (req, res) -> {
			return swaggerJson;
		});

		spark.Spark.after("/*", new PrezAccessLogFilter());
	}

	/**
	 * mount all resources in package
	 * @param packageName
	 */
	protected void mountAllResources(String packageName) {
		Reflections reflections = new Reflections(packageName);
		Set<Class<?>> apiClasses = reflections.getTypesAnnotatedWith(Api.class);
		for(Class<?> klass : apiClasses) {
		}
	}
	
	/**
	 * access log
	 */
	protected final Logger accesslog = LoggerFactory.getLogger(PrezAccessLogFilter.class);
}