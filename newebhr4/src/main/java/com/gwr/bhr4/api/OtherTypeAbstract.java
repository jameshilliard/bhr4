package com.gwr.bhr4.api;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.dto.JSONDto;
import com.gwr.bhr4.dto.JSONListDto;

public abstract class OtherTypeAbstract {
	protected String servletName = "";

	@SuppressWarnings("unchecked")
	protected String replaceAttribute(HttpServletRequest request, String key, String injs){
		String js = (String) request.getSession().getAttribute(key);
		JSONDto dto = new JSONDto(js);
		JSONDto dtoin = new JSONDto(injs);
		dto.getMap().putAll(dtoin.getMap());
		
		request.getSession().setAttribute(key, dto.getJson());
		
		return dto.getJson();
	}

	protected String getAttribute(HttpServletRequest request, String key){
		String json = (String) request.getSession().getAttribute(key);
		return json;
	}

}
