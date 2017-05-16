package org.prez.core;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;

import javax.annotation.PostConstruct;

import org.prez.model.TechnicalException;
import org.springframework.stereotype.Component;

import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;

/**
 * main daemon
 */
@Component
public class OrientDBEmbeddable {
	/**
	 * main starter
	 */
	@PostConstruct
	public void server() {
		OServer server;
		try {
			server = OServerMain.create();
		} catch (Exception e) {
			throw new TechnicalException(e);
		}
		try {
			server.startup(getClass().getResourceAsStream("/orientdb.xml"));
		} catch (InstantiationException e) {
			throw new TechnicalException(e);
		} catch (IllegalAccessException e) {
			throw new TechnicalException(e);
		} catch (ClassNotFoundException e) {
			throw new TechnicalException(e);
		} catch (IllegalArgumentException e) {
			throw new TechnicalException(e);
		} catch (SecurityException e) {
			throw new TechnicalException(e);
		} catch (InvocationTargetException e) {
			throw new TechnicalException(e);
		} catch (NoSuchMethodException e) {
			throw new TechnicalException(e);
		} catch (IOException e) {
			throw new TechnicalException(e);
		}
		try {
			server.activate();
		} catch (ClassNotFoundException e) {
			throw new TechnicalException(e);
		} catch (InstantiationException e) {
			throw new TechnicalException(e);
		} catch (IllegalAccessException e) {
			throw new TechnicalException(e);
		}
	}
}
