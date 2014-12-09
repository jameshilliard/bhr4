package com.gwr.api.logout;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.api.login.LoginServlet;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.StringUtil;

@WebServlet("/api/logout")
public class LogoutServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private final static Logger logger = LoggerFactory
			.getLogger(LogoutServlet.class);

	/**
	 * 
	 */
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		logger.debug("Logout " + request.getSession().getId());

		// remove all cookies
		Cookie[] cookies = request.getCookies();
		if (cookies != null) {
			for (Cookie cookie : cookies) {
				// set the expiration to zero to have client immediately clear
				// all cookies.
				cookie.setMaxAge(0);
			}
		}

		// invalidate the session to clear everything out
		request.getSession().invalidate();
	}

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		this.doPost(request, response);
	}

}
