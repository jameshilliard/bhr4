package com.gwr.bhr4.api.dhcp;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.api.dhcp.model.DHCPClients;
import com.gwr.bhr4.dto.JSONListDto;

@Controller
@RequestMapping("/api/dhcp/clients")
public class DHCPClientsServlet {

	String servletName = getClass().getSimpleName();
	String idName = "id";
	
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
	public void put(@RequestBody String inStr, @PathVariable String id,
			HttpServletRequest request) {
		
		String js = (String) request.getSession().getAttribute(servletName);
		DHCPClients clients = new DHCPClients(js);
		boolean replaceMac = clients.replaceDHCPClientByWhat(inStr, "mac");
		if (replaceMac) {
			String jsont = clients.getJson();
			request.getSession().setAttribute(servletName, jsont);
		}
	
	}
	
	@RequestMapping(value = "{id}", method = RequestMethod.POST)
	public void post(@RequestBody String inStr, @PathVariable String id,
			HttpServletRequest request) {
		
		this.put(inStr, id, request);
	}
}
