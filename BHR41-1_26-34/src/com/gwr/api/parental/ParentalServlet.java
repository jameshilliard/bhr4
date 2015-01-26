package com.gwr.api.parental;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.ServletRequestUtilities1;

@WebServlet("/api/parental/*")
public class ParentalServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static String serviceName = "parental";
	private static String idName = "id";

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

//		ServletRequestUtilities.handleGetRequestByIndex(serviceName, getClass()
//				.getSimpleName(), idName, request, response);
		ServletRequestUtilities1.handleGetRequestByIndex(serviceName, getClass()
				.getSimpleName(), request, response);
	}

	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

//		ServletRequestUtilities.handlePutRequestByIndex(serviceName, getClass()
//				.getSimpleName(), idName, request, response);
		ServletRequestUtilities1.handlePutRequestByIndex(serviceName, getClass()
				.getSimpleName(), request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

//		ServletRequestUtilities.addToJSONArrayByID(idName, getClass()
//				.getSimpleName(), request, response);
		ServletRequestUtilities1.addToJSONArrayByID(getClass()
				.getSimpleName(), request, response);
	}

	@Override
	protected void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

//		ServletRequestUtilities.deleteFromJSONArrayByID(idName, getClass()
//				.getSimpleName(), request, response);
		ServletRequestUtilities1.deleteFromJSONArrayByID(getClass()
				.getSimpleName(), request, response);
	}
}
