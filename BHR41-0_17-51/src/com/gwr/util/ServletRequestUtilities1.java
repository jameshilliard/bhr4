package com.gwr.util;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.util.json.SimpleJson;

/**
 * Extracts the JSON request from the POST/PUT/GET request
 * 
 * @author Paul Hsu
 * 
 */
public class ServletRequestUtilities1 {
	private final static Logger logger = LoggerFactory
			.getLogger(ServletRequestUtilities1.class);

	/**
	 * 
	 * @param request
	 * @param response
	 */
	public static void deleteFromJSONArrayByID(	String servletName, HttpServletRequest request,
			HttpServletResponse response) {

		logger.info("Delete " + request.getRequestURI());
		int id = Integer.parseInt(request.getRequestURI().substring(
				request.getRequestURI().lastIndexOf("/") + 1));

		String all = (String) request.getSession()
				.getAttribute(servletName);
		List<Map> allMaps = SimpleJson.getJsonObjects(all);
		allMaps.remove(id);


		String result = SimpleJson.toJsonText(allMaps);
		request.getSession().setAttribute(servletName, result);
	}

	/**
	 * 
	 * @param string
	 * @param simpleName
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	public static void addToJSONArrayByID(String servletName,
			HttpServletRequest request, HttpServletResponse response)
			throws IOException {

		logger.info("Add by Array index " + request.getRequestURI());

		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);

		Map addMap = SimpleJson.getJsonObject(in);
		String all = (String) request.getSession()
				.getAttribute(servletName);
		List<Map> allMaps = SimpleJson.getJsonObjects(all);
		allMaps.add(addMap);


		String result = SimpleJson.toJsonText(allMaps);
		request.getSession().setAttribute(servletName, result);
	}


	public static void handleGetRequestByIndex(String serviceName,
			String servletName, HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		if (StringUtils.isNotEmpty(id)) {
			logger.info("Get by Array Index " + request.getRequestURI());
			String all = (String) request.getSession()
					.getAttribute(servletName);
			String newJson = SimpleJson.getJsonTextByListIndex(id, all);
			ServletRequestUtilities.sendJSONResponse(newJson, response);
		} else {
			ServletRequestUtilities.handleGetRequest(servletName, request,
					response);
		}
	}

	@SuppressWarnings("rawtypes")
	public static void handlePutRequestByIndex(String serviceName,
			String servletName, HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);

		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		String newAll = "";
		String returnJson = "";
		if (StringUtils.isNotEmpty(id)) {
			logger.info("Update by Array index " + request.getRequestURI());
			String all = (String) request.getSession()
					.getAttribute(servletName);
			List<Map> maps = SimpleJson.replaceFieldsByListIndex(id, all,
					in);
			newAll = SimpleJson.toJsonText(maps);
			returnJson = in;
		} else {
			logger.info("Update " + request.getRequestURI());
			newAll = in;
			returnJson = in;
		}
		logger.info(in);

		request.getSession().setAttribute(servletName, newAll);
		ServletRequestUtilities.sendJSONResponse(returnJson, response);
	}


}
