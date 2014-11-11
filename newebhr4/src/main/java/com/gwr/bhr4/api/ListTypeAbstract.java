package com.gwr.bhr4.api;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.dto.JSONListDto;

public abstract class ListTypeAbstract {
	protected String servletName = "";
	protected String idName = "";

	@RequestMapping(method = RequestMethod.GET)
	public String getAll(HttpServletRequest request) {
		String all = (String) request.getSession().getAttribute(servletName);

		return all;

	}

	@RequestMapping(value = "{id}", method = RequestMethod.GET)
	public String getOne(@PathVariable String id, HttpServletRequest request) {

		String all = (String) request.getSession().getAttribute(servletName);

		JSONListDto dto = new JSONListDto(all);
		return dto.getJsonTextByIndex(idName, id);

	}

	@RequestMapping(value = "{id}", method = RequestMethod.PUT)
	public void update(@RequestBody String inStr, @PathVariable String id,
			HttpServletRequest request) {

		String all = (String) request.getSession().getAttribute(servletName);

		JSONListDto dto = new JSONListDto(all);
		dto.replaceFieldsByIndex(idName, id, inStr);

	}
	
	@RequestMapping(value = "{id}", method = RequestMethod.DELETE)
	public void delete(@PathVariable String id,
			HttpServletRequest request) {

		String all = (String) request.getSession().getAttribute(servletName);

		JSONListDto dto = new JSONListDto(all);
		dto.deleteByIndexName(idName, id);

	}

}
