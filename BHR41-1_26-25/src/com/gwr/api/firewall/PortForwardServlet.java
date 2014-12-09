package com.gwr.api.firewall;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.gwr.util.ServletRequestUtilities;

@WebServlet("/api/firewall/portforward/*")
public class PortForwardServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static String serviceName = "portforward";
	private static String idName = "id";

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handleGetRequestByIndex(serviceName, getClass()
				.getSimpleName(), idName, request, response);
	}

	/**
	 * 
	 */
	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handlePutRequestByIndex(serviceName, getClass()
				.getSimpleName(), idName, request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.addToJSONArrayByID(idName, getClass()
				.getSimpleName(), request, response);
	}

	@Override
	protected void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.deleteFromJSONArrayByID(idName, getClass()
				.getSimpleName(), request, response);
	}
}
