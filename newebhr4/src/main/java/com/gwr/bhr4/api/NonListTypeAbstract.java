package com.gwr.bhr4.api;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.dto.JSONDto;
import com.gwr.bhr4.dto.JSONListDto;

public abstract class NonListTypeAbstract {
	protected String servletName = "";

	@RequestMapping(method = RequestMethod.GET)
	public String read(HttpServletRequest request) {
		String nowJson = (String) request.getSession().getAttribute(servletName);

		return nowJson;

	}

	@RequestMapping(method = RequestMethod.PUT)
	public String update(@RequestBody String inStr, HttpServletRequest request) {

		String nowJson = read(request);
		JSONDto jsonDto = new JSONDto(nowJson);
		jsonDto.replaceJsonFields(inStr);
		request.getSession().setAttribute(servletName, jsonDto.getJson());

		return inStr;

	}

}
