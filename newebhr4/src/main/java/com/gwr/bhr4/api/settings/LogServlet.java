package com.gwr.bhr4.api.settings;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/api/settings/log/")
public class LogServlet extends HttpServlet {
	private final static Logger logger = LoggerFactory
			.getLogger(LogServlet.class);
	@RequestMapping(value = "{id}", method = RequestMethod.GET)
	public String get(@PathVariable String id, HttpServletRequest request) {
		String key = getClass().getSimpleName() + id;

		String json = (String) request.getSession().getAttribute(key);
		return json;

	}

	@RequestMapping(value = "{id}", method = RequestMethod.DELETE)
	public void delete(@PathVariable String id, HttpServletRequest request) {

		String key = getClass().getSimpleName() + id;
		request.getSession().setAttribute(key, "");
	}
}
