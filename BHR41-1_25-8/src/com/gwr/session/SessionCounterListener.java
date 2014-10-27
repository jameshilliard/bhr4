package com.gwr.session;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SessionCounterListener implements HttpSessionListener {

	private static int totalActiveSessions = 0;
	private final static Logger logger = LoggerFactory
			.getLogger(SessionCounterListener.class);
	public static int getTotalActiveSession() {
		return totalActiveSessions;
	}


	public void sessionCreated(HttpSessionEvent event) {
		totalActiveSessions++;
		logger.debug("sessionCreated " + totalActiveSessions +":" + event.getSession().getId());
	}


	public void sessionDestroyed(HttpSessionEvent event) {
		if(totalActiveSessions > 0)
			totalActiveSessions--;
		logger.debug("sessionDestroyed " + totalActiveSessions + ":" + event.getSession().getId());
	}
}