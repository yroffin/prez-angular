/**
 *  Copyright 2015 Yannick Roffin
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

package org.prez.core;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * simple bootstrap for rest bootstrap
 */
@Configuration
@EnableAutoConfiguration
@ComponentScan
public class PrezSwaggerServer {
	protected static String normalizedPath = PrezSwaggerServer.getNormalizedPath();
	
	private static String getNormalizedPath() {
		/**
		 * set normalized path in properties
		 */
		Path absolutePath = Paths.get(".").toAbsolutePath().normalize();
		String prefix = absolutePath.getRoot().toString();
		String normalizedPath = absolutePath.toString().replace(prefix, "\\").replace("\\", "/");
		/**
		 * fix properties
		 */
		if(System.getProperty("jarvis.user.dir") == null) {
			System.setProperty("jarvis.user.dir", normalizedPath);
		}
		if(System.getProperty("jarvis.log.dir") == null) {
			System.setProperty("jarvis.log.dir", normalizedPath);
		}
		return normalizedPath;
	}
	
	protected static Logger logger = LoggerFactory.getLogger(PrezSwaggerServer.class);

	/**
	 * main entry
	 * 
	 * @param args
	 * @throws MalformedURLException 
	 */
	public static void main(String[] args) throws MalformedURLException {
		/**
		 * start application
		 */
		SpringApplication.run(PrezSwaggerServer.class, args);
	}
}
