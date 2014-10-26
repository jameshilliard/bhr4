package com.gwr.api.users;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.api.login.LoginServlet;
import com.gwr.api.users.model.User;
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
@WebServlet("/api/users/*")
public class UsersServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private final static Logger logger = LoggerFactory
			.getLogger(UsersServlet.class);
	private static String serviceName = "users";

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
			User users = new User(js);
			json = users.getUserJsonByIndex(id);
		} else {
			json = js;
		}
		ServletRequestUtilities.sendJSONResponse(json, response);

	}

	// {"users":[{"emailNotificationAddress":"","fullName":"Administrator","id":0,"securityNotifyLevel":0,"systemNotifyLevel":0,"password":"test"}]}
	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);
		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		if (StringUtils.isNotEmpty(id)) {
			User users = new User(js);
			Map map = SimpleJson.getJsonObject(in);
			List<Map> maps = (List<Map>) map.get("users");
			for (Map p : maps) {
				Long id1 = (Long) p.get("id");
				users.replaceUser(id1.toString(), p);
			}
			request.getSession().setAttribute(getClass().getSimpleName(),
					users.getJson());
			ServletRequestUtilities.sendJSONResponse(in, response);
		}
		else
		{
			String finalJson= HttpSessionUtil.replaceAttributes(getClass().getSimpleName(), in, request);

			request.getSession().setAttribute(getClass().getSimpleName(),
					finalJson);
			ServletRequestUtilities.sendJSONResponse(finalJson, response);
		}
	}

	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);

		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		User users = new User(js);

		users.addUser(in);

		request.getSession().setAttribute(getClass().getSimpleName(),
				users.getJson());
		ServletRequestUtilities.sendJSONResponse(users.getJson(), response);
	}

	@Override
	protected void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		User users = new User(js);

		if (StringUtils.isNotEmpty(id)) {
			users.deleteUserByIndex(id);
		}
		request.getSession().setAttribute(getClass().getSimpleName(),
				users.getJson());
		ServletRequestUtilities.sendJSONResponse(users.getJson(), response);
	}
}
