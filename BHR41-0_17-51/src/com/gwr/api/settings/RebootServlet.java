package com.gwr.api.settings;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author jerry skidmore
 * 
 */
@WebServlet("/api/settings/reboot")
public class RebootServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private final static Logger logger = LoggerFactory
			.getLogger(RebootServlet.class);

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		// TODO maybe we should log them out????
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// remove all cookies
		logger.debug("Reboot " + request.getSession().getId());
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

}
