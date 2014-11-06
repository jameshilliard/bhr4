package com.gwr.api.wireless;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.api.wireless.model.Wireless;
import com.gwr.util.GlobalConstants;
import com.gwr.util.HttpSessionUtil;
import com.gwr.util.JsonProperties;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.StringUtil;
import com.gwr.util.json.SimpleJson;

/**
 * 
 * @author jerry skidmore
 * 
 */
@WebServlet("/api/wireless/*")
public class WirelessServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static String serviceName = "wireless";
	private static String idName = "id";

	private static String TRANSMISSION = "transmission";
	private static String QOS = "qos";
	private static String WEP = "wep";
	private static String WPA = "wpa";
	private static String MACFILTER = "macfilter";
	private static String WPS = "wps";

	public static String TRAKEY = "wireless." + TRANSMISSION;
	public static String QOSKEY = "wireless." + QOS;
	public static String MACKEY = "wireless." + MACFILTER;
	public static String WPSKEY = "wireless." + WPS;

	private final static Logger logger = LoggerFactory
			.getLogger(WirelessServlet.class);

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String uri = request.getRequestURI();
		String json = "";
		logger.info("Wireless get: " + uri);

		if (uri.endsWith(TRANSMISSION)) {
			String id = TRAKEY + StringUtil.retrieveId(uri, TRANSMISSION);
			String def = JsonProperties.getWirelessTransmissionJSON(id);
			json = HttpSessionUtil.getSessionAttribute(request, id, def);
		} else if (uri.endsWith(QOS)) {
			String id = QOSKEY + StringUtil.retrieveId(uri, QOS);
			String def = JsonProperties.getWirelessQosJSON(id);
			json = HttpSessionUtil.getSessionAttribute(request, id, def);
		} else if (uri.endsWith(WEP)) {
			String id = StringUtil.retrieveId(uri, WEP);
			String js = (String) request.getSession().getAttribute(
					getClass().getSimpleName());
			Wireless wireless = new Wireless(js);
			json = wireless.getWepJson(id);
		} else if (uri.endsWith(WPA)) {
			String id = StringUtil.retrieveId(uri, WPA);
			if (id.equals("2")) {
				json = (String) request.getSession().getAttribute(
						GlobalConstants.WPA2Key);

			} else {
				String js = (String) request.getSession().getAttribute(
						getClass().getSimpleName());
				Wireless wireless = new Wireless(js);
				json = wireless.getWpaJson(id);
			}
		} else if (uri.endsWith(MACFILTER)) {
			String id = MACKEY + StringUtil.retrieveId(uri, MACFILTER);
			String def;
			if(id.equals("0"))
			  def = JsonProperties.getWirelessMacfilter0JSON();
			else
			  def = JsonProperties.getWirelessMacfilter1JSON();	
			json = HttpSessionUtil.getSessionAttribute(request, id, def);
		} else if (uri.endsWith(WPS)) {
			String id = WPSKEY + StringUtil.retrieveId(uri, WPS);
			String def = JsonProperties.getWirelessWpsJSON();
			json = HttpSessionUtil.getSessionAttribute(request, id, def);
		} else {

			String id = request.getRequestURI().substring(
					request.getRequestURI().lastIndexOf("/") + 1);

			if (id.equals("2") || id.equals("3")) {
				String js = (String) request.getSession().getAttribute(
						getClass().getSimpleName());
				Wireless wireless = new Wireless(js);
				json = wireless.getJsonByListIndex(id);

			} else {
				json = ServletRequestUtilities.getMapFromJSONArrayByID(idName,
						null, request.getContextPath() + "/api/wireless",
						getClass().getSimpleName(), request, response);
			}

		}
		ServletRequestUtilities.sendJSONResponse(json, response);
	}

	/**
	 * 
	 */
	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String uri = request.getRequestURI();
		String key = getClass().getSimpleName();

		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);
		logger.info("Wireless put: " + uri);
		logger.info(in);
		String finalJson = in;
		String returnJson = in;

		if (uri.endsWith(TRANSMISSION)) {
			key = TRAKEY + StringUtil.retrieveId(uri, TRANSMISSION);
			finalJson = HttpSessionUtil.replaceAttributes(key, in, request);
			returnJson = finalJson;
		} else if (uri.endsWith(QOS)) {
			key = QOSKEY + StringUtil.retrieveId(uri, QOS);
			finalJson = HttpSessionUtil.replaceAttributes(key, in, request);
			returnJson = finalJson;
		} else if (uri.endsWith(WEP)) {
			String id = StringUtil.retrieveId(uri, WEP);
			String js = (String) request.getSession().getAttribute(
					getClass().getSimpleName());
			Wireless wireless = new Wireless(js);
			wireless.replaceWep(id, in);
			finalJson = wireless.getJson();
			key = getClass().getSimpleName();
		} else if (uri.endsWith(WPA)) {
			String id = StringUtil.retrieveId(uri, WPA);
			if (id.equals("2")) {
				String nowJson = (String) request.getSession().getAttribute(
						GlobalConstants.WPA2Key);
				finalJson = SimpleJson.replaceJsonFields(nowJson, in);
				key = GlobalConstants.WPA2Key;

			} else {

				String js = (String) request.getSession().getAttribute(
						getClass().getSimpleName());

				Wireless wireless = new Wireless(js);
				wireless.replaceWpa(id, in);
				finalJson = wireless.getJson();
				key = getClass().getSimpleName();
			}
		} else if (uri.endsWith(MACFILTER)) {
			key = MACKEY + StringUtil.retrieveId(uri, MACFILTER);
			finalJson = HttpSessionUtil.replaceAttributes(key, in, request);
			returnJson = finalJson;
		} else if (uri.endsWith(WPS)) {
			key = WPSKEY + StringUtil.retrieveId(uri, WPS);
			finalJson = HttpSessionUtil.replaceAttributes(key, in, request);
			returnJson = finalJson;
		} else {
			String id = StringUtil.retrieveLastId(request.getRequestURI(),
					serviceName);
			if (StringUtils.isNotEmpty(id)) {
				String js = (String) request.getSession().getAttribute(
						getClass().getSimpleName());
				Wireless wireless = new Wireless(js);
				if (id.equals("2") || id.equals("3")) {
					wireless.replaceByListIndex(id, in);
					finalJson = wireless.getJson();
					returnJson = wireless.getJsonByListIndex(id);
				} else {
					wireless.replaceByIndex(id, in);
					finalJson = wireless.getJson();
					// return this
					returnJson = wireless.getJsonByIndex(id);
				}
			}

		}

		request.getSession().setAttribute(key, finalJson);
		// logger.debug("Wirelss put return: " + returnJson);
		ServletRequestUtilities.sendJSONResponse(returnJson, response);
	}

	// only api/wireless/:id/macfilter
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String uri = request.getRequestURI();
		logger.info("Wireless put: " + uri);
		if (uri.endsWith(MACFILTER)) {
			String key = MACKEY + StringUtil.retrieveId(uri, MACFILTER);
			ServletRequestUtilities.addToJSONArrayByID(idName, key, request,
					response);
		}
	}

	// only api/wireless/:id/macfilter
	@Override
	protected void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.deleteFromJSONArrayByID(idName, getClass()
				.getSimpleName(), request, response);
	}

}
