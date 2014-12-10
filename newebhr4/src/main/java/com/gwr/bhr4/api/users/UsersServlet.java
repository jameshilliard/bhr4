package com.gwr.bhr4.api.users;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.api.dhcp.model.DHCPClients;
import com.gwr.bhr4.api.users.model.User;

@Controller
@RequestMapping("/api/user")
public class UsersServlet {

	String servletName = getClass().getSimpleName();
	String idName = "id";

	@RequestMapping(method = RequestMethod.GET)
	public String getAll(HttpServletRequest request) {
		String all = (String) request.getSession().getAttribute(servletName);
		return all;

	}

	@RequestMapping(value = "{id}", method = RequestMethod.GET)
	public String getOneUser(@PathVariable String id, HttpServletRequest request) {

		String js = (String) request.getSession().getAttribute(servletName);
		User user = new User(js);

		return user.getUserJsonByIndex(id);

	}

	@RequestMapping(method = RequestMethod.PUT)
	public void updateAll(@RequestBody String inStr, HttpServletRequest request) {
		String js = (String) request.getSession().getAttribute(servletName);
		User user = new User(js);
		user.replaceAll(inStr);
		request.getSession().setAttribute(servletName, user.getJson());
	}

	// 
	@RequestMapping(value = "{id}", method = RequestMethod.PUT)
	public void updateOneUser(@RequestBody String inStr, @PathVariable String id,
			HttpServletRequest request) {

		String js = (String) request.getSession().getAttribute(servletName);
		User user = new User(js);
		user.replaceUser(id, inStr);

		request.getSession().setAttribute(servletName, user.getJson());

	}

	// add one
	@RequestMapping( method = RequestMethod.POST)
	public void addOneUser(@RequestBody String inStr,	HttpServletRequest request) {
		String js = (String) request.getSession().getAttribute(servletName);
		User user = new User(js);
		user.addUser(inStr);

		request.getSession().setAttribute(servletName, user.getJson());
	}

	@RequestMapping( method = RequestMethod.DELETE)
	public void deleteOneUser(@PathVariable String id,	HttpServletRequest request) {
		String js = (String) request.getSession().getAttribute(servletName);
		User user = new User(js);
		user.deleteUserByIndex(id);
		request.getSession().setAttribute(servletName, user.getJson());
	}
}
