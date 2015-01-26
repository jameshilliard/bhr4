package com.gwr.api.settings;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.gwr.util.ServletRequestUtilities;

@WebServlet("/api/settings/upnp")
public class UPNPServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handleGetRequest(getClass().getSimpleName(),
				request, response);
	}

	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handlePutRequest(getClass().getSimpleName(),
				request, response);
	}

}
