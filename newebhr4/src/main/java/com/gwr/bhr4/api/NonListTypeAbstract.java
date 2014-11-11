package com.gwr.bhr4.api;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.dto.JSONListDto;

public abstract class NonListTypeAbstract {
	protected String servletName = "";

	@RequestMapping(method = RequestMethod.GET)
	public String getAll(HttpServletRequest request) {
		String all = (String) request.getSession().getAttribute(servletName);

		return all;

	}

	@RequestMapping(method = RequestMethod.PUT)
	public String update(@RequestBody String inStr, HttpServletRequest request) {

		request.getSession().setAttribute(servletName, inStr);

		return inStr;

	}

}
