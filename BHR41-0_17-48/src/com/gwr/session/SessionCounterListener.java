package com.gwr.session;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

public class SessionCounterListener implements HttpSessionListener {

	private static int totalActiveSessions = 0;

	public static int getTotalActiveSession() {
		return totalActiveSessions;
	}

	@Override
	public void sessionCreated(HttpSessionEvent event) {
		totalActiveSessions++;
		System.out.println("sessionCreated " + totalActiveSessions +":" + event.getSession().getId());
	}

	@Override
	public void sessionDestroyed(HttpSessionEvent event) {
		if(totalActiveSessions > 0)
			totalActiveSessions--;
		System.out.println("sessionDestroyed " + totalActiveSessions + ":" + event.getSession().getId());
	}
}