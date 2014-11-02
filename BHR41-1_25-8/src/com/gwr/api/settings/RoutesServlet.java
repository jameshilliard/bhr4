package com.gwr.api.settings;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.gwr.api.settings.model.Routes;
import com.gwr.api.users.model.User;
import com.gwr.util.HttpSessionUtil;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.StringUtil;
import com.gwr.util.json.SimpleJson;

/**
 * 
 * @author Paul Hsu
 * 
 */
@WebServlet("/api/settings/routes/*")
public class RoutesServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static String serviceName = "routes";
	private static String idName = "id";

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String json = "";
		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());

		if (StringUtils.isNotEmpty(id)) {
			Routes route = new Routes(js);
			json = route.getRouteJsonByIndex(id);
		} else {
			json = js;
		}
		ServletRequestUtilities.sendJSONResponse(json, response);
	}

	// update
	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);
		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		if (StringUtils.isNotEmpty(id)) {
			Routes route = new Routes(js);
			route.replaceRoute(id, in);
			request.getSession().setAttribute(getClass().getSimpleName(),
					route.getJson());
			ServletRequestUtilities.sendJSONResponse(in, response);
		} else {
			String finalJson = HttpSessionUtil.replaceAttributes(getClass()
					.getSimpleName(), in, request);
			request.getSession().setAttribute(getClass().getSimpleName(),
					finalJson);
			ServletRequestUtilities.sendJSONResponse(finalJson, response);
		}
	}

	// {"type":0,"destination":"192.168.1.10","netmask":"255.255.255.255","gateway":"192.168.1.23","metric":0}
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);

		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		Routes route = new Routes(js);

		route.addRoute(in);

		request.getSession().setAttribute(getClass().getSimpleName(),
				route.getJson());
		ServletRequestUtilities.sendJSONResponse(route.getJson(), response);
	}

	@Override
	protected void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		Routes route = new Routes(js);

		if (StringUtils.isNotEmpty(id)) {
			route.deleteRouteByIndex(id);
		}
		request.getSession().setAttribute(getClass().getSimpleName(),
				route.getJson());
		ServletRequestUtilities.sendJSONResponse(route.getJson(), response);
	}
}
