package com.gwr.api.dhcp;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.gwr.api.dhcp.model.DHCPClients;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.StringUtil;

@WebServlet("/api/dhcp/*")
public class DHCPServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	public static String DHCPClients = "DHCPClientsServlet";
	public static String DHCPOptions = "DHCPOptionsServlet";
	private static String serviceName = "clients";
	private static String optionsService = "options";
	private static String idName = "id";

	// call by api/dhcp api/dhcp/options api/dhcp/clients api/dhcp/clients/1
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
		// api/dhcp/options
		if (uri.endsWith(optionsService)) {
			ServletRequestUtilities.handleGetRequest(DHCPOptions, request,
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
