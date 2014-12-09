package com.gwr.api.firewall;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.api.login.LoginServlet;
import com.gwr.util.ServletRequestUtilities;

@WebServlet("/api/firewall")
public class FirewallServlet extends HttpServlet {
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

	/**
	 * 
	 */
	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handlePutRequest(getClass().getSimpleName(),
				request, response);
	}

}
