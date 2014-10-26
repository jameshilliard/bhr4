package com.gwr.api.devices;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.gwr.util.ServletRequestUtilities;

/**
 * 
 * @author jerry skidmore
 * 
 */
@WebServlet("/api/devices/*")
public class DevicesServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private static String serviceName = "devices";
	private static String idName = "id";

	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handleGetRequestByIndex(serviceName, getClass()
				.getSimpleName(), idName, request, response);
	}

	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handlePutRequestByIndex(serviceName, getClass()
				.getSimpleName(), idName, request, response);

	}

}
