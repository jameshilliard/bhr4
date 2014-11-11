package com.gwr.bhr4.api.settings;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/api/settings/reboot/")
public class RebootServlet {
	private final static Logger logger = LoggerFactory
			.getLogger(RebootServlet.class);

	@RequestMapping(method = RequestMethod.GET)
	public void get(HttpServletRequest request) {
		post(request);

	}

	@RequestMapping(method = RequestMethod.POST)
	public void post(HttpServletRequest request) {
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
		try {
			Thread.sleep(3000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}
