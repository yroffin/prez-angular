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

package org.prez.core.resources;

import java.io.File;

import org.prez.model.TechnicalException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * core resources (ui, ...)
 */
@Component
public class CoreResources {
	protected Logger logger = LoggerFactory.getLogger(CoreResources.class);

	@Autowired
	Environment env;

	/**
	 * work dir
	 */
	private File resources = null;
	
	/**
	 * mount local resource
	 */
	public void mountLocal() {
		logger.info("Mount local files on {}", "public");
		spark.Spark.staticFiles.location("/public");
		spark.Spark.staticFiles.externalLocation("public");
	}

	/**
	 * deltree
	 * @param dir
	 * @throws Exception
	 */
	private static void deltree(File dir) throws Exception {

        String[] list = dir.list();
        for (int i = 0; i < list.length; i++) {
            String s = list[i];
            File f = new File(dir, s);
            if (f.isDirectory()) {
            	deltree(f);
            } else {
                if (!f.delete()) {
                    throw new TechnicalException("Unable to delete file "
                                             + f.getAbsolutePath());
                }
            }
        }
        if (!dir.delete()) {
            throw new TechnicalException("Unable to delete directory "
                                     + dir.getAbsolutePath());
        }
    }

	/**
	 * mount local resource
	 */
	public void mountExternal() {
		/**
		 * mount resources
		 */
		spark.Spark.staticFiles.location("/public");
		
		Runtime.getRuntime().addShutdownHook(new Thread() {
	        @Override
	        public void run() {
	        	logger.warn("Delete resource {}", resources.getAbsolutePath());
	        	try {
	        		deltree(resources);
				} catch (Exception e) {
		        	logger.warn("While deleting {} {}", resources.getAbsolutePath(), e);
				}
	        }
	    });
	}
}