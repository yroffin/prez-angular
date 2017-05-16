package org.prez.core;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.pac4j.core.exception.TechnicalException;
import org.reflections.Reflections;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.annotations.Api;
import io.swagger.jaxrs.Reader;
import io.swagger.jaxrs.config.BeanConfig;
import io.swagger.models.Operation;
import io.swagger.models.Path;
import io.swagger.models.Response;
import io.swagger.models.Swagger;
import io.swagger.models.parameters.Parameter;
import io.swagger.models.parameters.SerializableParameter;

/**
 * swagger init
 */
public class SwaggerParser {

	/**
	 * retrieve
	 * 
	 * @param packageName
	 * @return String
	 */
	public static String getSwaggerJson(String packageName) {
		Swagger swagger = getSwagger(packageName);
		String json;
		try {
			json = swaggerToJson(swagger);
		} catch (JsonProcessingException e) {
			throw new TechnicalException(e);
		}
		return json;
	}

	/**
	 * scan package
	 * 
	 * @param packageName
	 * @return Swagger
	 */
	public static Swagger getSwagger(String packageName) {
		Reflections reflections = new Reflections(packageName);

		BeanConfig beanConfig = new BeanConfig();
		beanConfig.setResourcePackage(packageName);
		beanConfig.setScan(true);
		beanConfig.scanAndRead();
		Swagger swagger = beanConfig.getSwagger();

		Reader reader = new Reader(swagger);

		Set<Class<?>> apiClasses = reflections.getTypesAnnotatedWith(Api.class);
		reader.read(apiClasses);

		jarvisExtension(swagger, apiClasses);

		return swagger;
	}

	private static void swaggerExtensionScan(Swagger swagger) {
	}

	/**
	 * add a new rest operation in swagger
	 * 
	 * @param swagger
	 * @param klass
	 * @param resource
	 * @param ope
	 * @param summary
	 * @param parameters
	 * @param body
	 * @param responses
	 */
	private static void addOperation(Swagger swagger, Class<?> klass, String resource, String ope, String summary,
			List<SerializableParameter> parameters, Parameter body, Map<Integer, Response> responses) {
		Api apiAnnotation = klass.getAnnotationsByType(Api.class)[0];

		if (swagger.getPath(resource) == null) {
			swagger.path(resource, new Path());
		}

		Operation operation = new Operation();
		/**
		 * fix tag, and operation attributes
		 */
		operation.tag(apiAnnotation.value());
		operation.summary(summary);
		operation.produces("application/json");
		/**
		 * set operation
		 */
		swagger.getPath(resource).set(ope, operation);
		/**
		 * parameters
		 */
		if (body != null) {
			operation.parameter(body);
		}
		for (Parameter prm : parameters) {
			operation.parameter(prm);
		}
		/**
		 * responses
		 */
		for (Entry<Integer, Response> entry : responses.entrySet()) {
			operation.response(entry.getKey(), entry.getValue());
		}
	}

	@SuppressWarnings("unchecked")
	private static void jarvisExtension(Swagger swagger, Set<Class<?>> apiClasses) {
		apiClasses.forEach(klass -> {
			/**
			 * scan for default resource
			 */
			swaggerExtensionScan(swagger);
		});
	}

	/**
	 * to json
	 * 
	 * @param swagger
	 * @return String
	 * @throws JsonProcessingException
	 */
	public static String swaggerToJson(Swagger swagger) throws JsonProcessingException {
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.setSerializationInclusion(Include.NON_EMPTY);
		String json = objectMapper.writeValueAsString(swagger);
		return json;
	}
}
