package com.gwr.bhr4.api.dhcp;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.api.ListTypeAbstract;
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
	
	@RequestMapping(value = "{id}", method = RequestMethod.put)
	public void put(@PathVariable String id,
			HttpServletRequest request) {
		
		String js = (String) request.getSession().getAttribute(DHCPClients);
		DHCPClients clients = new DHCPClients(js);
		boolean replaceMac = clients.replaceDHCPClientByWhat(in, "mac");
		if (replaceMac) {
			String jsont = clients.getJson();
			request.getSession().setAttribute(DHCPClients, jsont);
		}
	
	}
}
public class DHCPClientsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private static String serviceName = "clients";
	private static String idName = "id";

	// call by api/dhcp api/dhcp/clients api/dhcp/clients/1
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);

		String uri = request.getRequestURI();
		// api/dhcp/clients
		if (uri.endsWith(serviceName)) {
			ServletRequestUtilities.handleGetRequest(DHCPClients, request,
					response);
			return;
		}
		// api/dhcp/clients/1
		if (StringUtils.isNotEmpty(id)) {
			ServletRequestUtilities.handleGetRequestByIndex(serviceName,
					DHCPClients, idName, request, response);
		} else {
			// api/dhcp
			ServletRequestUtilities.handleGetRequest(
					getClass().getSimpleName(), request, response);
		}
	}

	

	
	
	// only call by api/dhcp/clients POST
	// UI may call api/dhcp/client POST(should be PUT) to do update, use mac address as unique value to do update
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);
		String js = (String) request.getSession().getAttribute(DHCPClients);
		DHCPClients clients = new DHCPClients(js);
		boolean replaceMac = clients.replaceDHCPClientByWhat(in, "mac");
		if (replaceMac) {
		} else {
			clients.addClient(in);
		}

		String jsont = clients.getJson();
		request.getSession().setAttribute(DHCPClients, jsont);
	}

	// call by api/dhcp, api/dhcp/clients, api/dhcp/clients/1
	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);

		String uri = request.getRequestURI();
		// api/dhcp/clients
		if (uri.endsWith(serviceName)) {
			ServletRequestUtilities.handlePutRequest(DHCPClients, request,
					response);
			return;
		}
		// api/dhcp/clients/1
		if (StringUtils.isNotEmpty(id)) {
			String in = ServletRequestUtilities.getJSONFromPUTRequest(request);
			String js = (String) request.getSession().getAttribute(DHCPClients);
			DHCPClients clients = new DHCPClients(js);
			boolean replaceMac = clients.replaceDHCPClientByWhat(in, "mac");
			if (replaceMac) {
				String jsont = clients.getJson();
				request.getSession().setAttribute(DHCPClients, jsont);
			}
		} else {
			// api/dhcp
			ServletRequestUtilities.handlePutRequest(
					getClass().getSimpleName(), request, response);
		}
	
	}

	// only call by api/dhcp/clients/1
	@Override
	protected void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
        // api/dhcp/clients/1
		if (StringUtils.isNotEmpty(id)) {
			ServletRequestUtilities.deleteFromJSONArrayByID(idName,
					DHCPClients, request, response);

		}
	}

}
