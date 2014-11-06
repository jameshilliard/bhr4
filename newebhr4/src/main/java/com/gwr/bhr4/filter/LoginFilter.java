package com.gwr.bhr4.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.util.ServletRequestUtilities;

public class LoginFilter implements Filter {
	private final static Logger logger = LoggerFactory
			.getLogger(LoginFilter.class);

	public void destroy() {

	}

	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws IOException, ServletException {

		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;
		HttpSession session = request.getSession(false);
		if (SessionCounterListener.getTotalActiveSession() > 150) {
			logger.error("too many users");
			if (null != session)
				session.invalidate();
			ServletRequestUtilities.reponse401(response, 0);
			return;
		}

		chain.doFilter(request, response);
	}

	public void init(FilterConfig arg0) throws ServletException {

	}

}
