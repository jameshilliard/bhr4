package com.gwr.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.util.json.JsonDataModel;
import com.gwr.util.json.SimToUIJSONModelListResponse;
import com.gwr.util.json.SimToUIJSONModelResponse;
import com.gwr.util.json.SimpleJson;
import com.gwr.util.json.UIToSimModelListRequest;
import com.gwr.util.json.UIToSimModelRequest;

/**
 * Extracts the JSON request from the POST/PUT/GET request
 * 
 * @author jerry skidmore
 * 
 */
public class ServletRequestUtilities {
	private final static Logger logger = LoggerFactory
			.getLogger(ServletRequestUtilities.class);

	private static final String failString = JsonProperties.getLoginFailJSON();
	/**
	 * 
	 * @param request
	 * @return
	 * @throws IOException
	 */
	public static String getJSONFromPUTRequest(HttpServletRequest request)
			throws IOException {

		InputStream is = request.getInputStream();
		if (is == null)
			return null;

		StringBuilder sb = new StringBuilder();

		try {
			char ch;
			for (int i = 0; i < request.getContentLength(); i++) {
				ch = (char) is.read();
				sb.append(ch);
			}
		} finally {
			if (is != null)
				is.close();
		}

		return sb.toString();
	}

	/**
	 * Some of the UI screens use Lists of JSON objects for display purposes,
	 * but when editing it's done on a one by one basis, so we need an
	 * individual Object from that list. We get that Object by id.
	 * 
	 * @param idString
	 *            the Map key that is the ID-string
	 * @param listKey
	 *            Map key that holds the List<JsonDataMap>
	 * @param apiURL
	 * @param servletName
	 * @param request
	 * @param response
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static String getMapFromJSONArrayByID(String idString,
			String listKey, String apiURL, String servletName,
			HttpServletRequest request, HttpServletResponse response) {

		String json = (String) request.getSession().getAttribute(servletName);

		if (apiURL.equals(request.getRequestURI())) {
			return json;
		} else {
			int id = Integer.parseInt(request.getRequestURI().substring(
					request.getRequestURI().lastIndexOf("/") + 1));

			List<JsonDataModel> modelList = null;

			if (listKey == null) {
				UIToSimModelListRequest req = new UIToSimModelListRequest(json);
				modelList = req.getModelList();
			} else {
				UIToSimModelRequest req = new UIToSimModelRequest(json);
				// will throw class cast exception. Need to extract it as
				// Map<String,Object) and convert
				modelList = (List<JsonDataModel>) req.getJsonDataModel()
						.getMap().get(listKey);
			}

			for (JsonDataModel model : modelList) {
				Long lid = (Long) model.getMap().get(idString);
				//System.out.println(lid);
				if (lid == id) {
					SimToUIJSONModelResponse modelResponse = new SimToUIJSONModelResponse();
					modelResponse.setModel(model);

					return modelResponse.toJSON();
				}
			}
		}

		return "";
	}

	/**
	 * 
	 * @param request
	 * @param response
	 */
	public static void deleteFromJSONArrayByID(String idString,
			String servletName, HttpServletRequest request,
			HttpServletResponse response) {

		logger.info("Delete " + request.getRequestURI());
		int id = Integer.parseInt(request.getRequestURI().substring(
				request.getRequestURI().lastIndexOf("/") + 1));

		UIToSimModelListRequest req = new UIToSimModelListRequest(
				(String) request.getSession().getAttribute(servletName));
		List<JsonDataModel> modelList = req.getModelList();

		for (int i = 0; i < modelList.size(); i++) {
			Long lid = (Long)((JsonDataModel) modelList.get(i)).getMap()
					.get(idString);

			if (lid == id) {
				modelList.remove(i);
				break;
			}
		}

		SimToUIJSONModelListResponse res = new SimToUIJSONModelListResponse();
		res.setModelList(modelList);

		request.getSession().setAttribute(servletName, res.toJSON());
	}

	
	public static void deleteFromJSONArrayByListIndex(String idString,
			String servletName, HttpServletRequest request,
			HttpServletResponse response) {

		logger.info("Delete " + request.getRequestURI());
		int id = Integer.parseInt(request.getRequestURI().substring(
				request.getRequestURI().lastIndexOf("/") + 1));

		UIToSimModelListRequest req = new UIToSimModelListRequest(
				(String) request.getSession().getAttribute(servletName));
		List<JsonDataModel> modelList = req.getModelList();

        modelList.remove(id);
		SimToUIJSONModelListResponse res = new SimToUIJSONModelListResponse();
		res.setModelList(modelList);

		request.getSession().setAttribute(servletName, res.toJSON());
	}

	/**
	 * 
	 * @param string
	 * @param simpleName
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	public static void addToJSONArrayByID(String idString, String servletName,
			HttpServletRequest request, HttpServletResponse response)
			throws IOException {

		logger.info("Add by index " + request.getRequestURI());

		UIToSimModelListRequest req = new UIToSimModelListRequest(
				(String) request.getSession().getAttribute(servletName));
		List<JsonDataModel> modelList = req.getModelList();

		JsonDataModel dataModel = getJSONFromServletPOST(request);
		long nextID = getNextIDInList(idString, modelList);
		dataModel.getMap().put(idString, nextID);
		modelList.add(dataModel);

		SimToUIJSONModelListResponse res = new SimToUIJSONModelListResponse();
		res.setModelList(modelList);

		request.getSession().setAttribute(servletName, res.toJSON());
	}

	/**
	 * 
	 * @param modelList
	 * @return
	 */
	private static long getNextIDInList(String idString,
			List<JsonDataModel> modelList) {

		// if original array is empty, start with 1
		if (modelList == null || modelList.isEmpty())
			return 1;

		long maxIDInList = 0;
		for (JsonDataModel model : modelList) {
			Long lid = (Long)model.getMap().get(idString);

			if (lid > maxIDInList) {
				maxIDInList = lid;
			}
		}

		return (maxIDInList + 1);
	}

	/**
	 * 
	 * @return
	 * @throws IOException
	 */
	private static JsonDataModel getJSONFromServletPOST(
			HttpServletRequest request) throws IOException {
		StringBuilder sb = new StringBuilder();
		BufferedReader br = request.getReader();
		String str;

		while ((str = br.readLine()) != null) {
			sb.append(str);
		}

		logger.info("Post data: " + sb.toString());

		UIToSimModelRequest req = new UIToSimModelRequest(sb.toString());

		return req.getJsonDataModel();
	}

	/**
	 * 
	 * @param json
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	public static void sendJSONResponse(String json,
			HttpServletResponse response) throws IOException {
		response.setContentType("application/json");

		// Get the PrintWriter object from response to write the required JSON
		// object to the output stream
		PrintWriter out = response.getWriter();

		out.print(json);
		out.flush();
	}

	public static void handlePutRequest(String servletName,
			HttpServletRequest request, HttpServletResponse response)
			throws IOException {
		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);
		logger.info("Update " + request.getRequestURI());
		logger.info(in);
		String finalJson= HttpSessionUtil.replaceAttributes(servletName, in, request);
		request.getSession().setAttribute(servletName, finalJson);
		ServletRequestUtilities.sendJSONResponse(finalJson, response);

	}

	public static void handleGetRequest(String servletName,
			HttpServletRequest request, HttpServletResponse response)
			throws IOException {
		logger.info("Get " + request.getRequestURI());
		String outJson = (String) request.getSession()
				.getAttribute(servletName);
		if(outJson == null){
			logger.error(servletName + " has null session data.");
			ServletRequestUtilities.reponse401(response, 0);
		}
		else{
			ServletRequestUtilities.sendJSONResponse(outJson, response);
		}

	}

	public static void handleGetRequestByIndex(String serviceName,
			String servletName, String idName, HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		if (StringUtils.isNotEmpty(id)) {
			logger.info("Get by Index " + request.getRequestURI());
			String all = (String) request.getSession()
					.getAttribute(servletName);
			if(all == null){
				logger.error(serviceName + " " + request.getSession() + " " + servletName + " " + idName);
			}
//			else
//				logger.debug(all + " " + id + " " + idName);
			String newJson = SimpleJson.getJsonTextByIndex(idName, id, all);
			ServletRequestUtilities.sendJSONResponse(newJson, response);
		} else {
			ServletRequestUtilities.handleGetRequest(servletName, request,
					response);
		}
	}

	@SuppressWarnings("rawtypes")
	public static void handlePutRequestByIndex(String serviceName,
			String servletName, String idName, HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);

		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		String newAll = "";
		String returnJson = "";
		if (StringUtils.isNotEmpty(id)) {
			logger.info("Update by index " + request.getRequestURI());
			String all = (String) request.getSession()
					.getAttribute(servletName);
			List<Map> maps = SimpleJson.replaceFieldsByIndex(idName, id, all,
					in);
			newAll = SimpleJson.toJsonText(maps);
			returnJson = SimpleJson.getJsonTextByIndex(idName, id, maps);
		} else {
			logger.info("Update " + request.getRequestURI());
			newAll = in;
			returnJson = in;
		}
		logger.info(in);

		request.getSession().setAttribute(servletName, newAll);
		ServletRequestUtilities.sendJSONResponse(returnJson, response);
	}

	
	public static void reponse401(HttpServletResponse response, Integer tryTime) throws IOException
	{
		Map map = SimpleJson.getJsonObject(failString);
		map.put("attempts", tryTime);

		String back = SimpleJson.toJsonText(map);
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		ServletRequestUtilities.sendJSONResponse(back, response);
	
	}
}
