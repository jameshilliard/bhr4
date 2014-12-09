package com.gwr.api.settings;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.gwr.util.ServletRequestUtilities;

@WebServlet("/api/settings/ddns/*")
public class DdnsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static String serviceName = "ddns";
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
		// the bug in front end. When it delete it delete by array index not by id key
		ServletRequestUtilities.deleteFromJSONArrayByListIndex(idName, getClass()
				.getSimpleName(), request, response);
//		ServletRequestUtilities.deleteFromJSONArrayByID(idName, getClass()
//				.getSimpleName(), request, response);
	}
}
