package com.gwr.util;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.gwr.util.json.SimpleJson;

public class HttpSessionUtil {

	static public String getSessionAttribute(HttpSession session, String key,
			String defaultValue) {

		if (null == session.getAttribute(key)) {
			session.setAttribute(key, defaultValue);
		}

		return (String) session.getAttribute(key);
	}

	static public String getSessionAttribute(HttpServletRequest req,
			String key, String defaultValue) {
		return getSessionAttribute(req.getSession(), key, defaultValue);
	}

	static public void setSessionAttribute(HttpSession session, String key,
			String value) {

		session.setAttribute(key, value);
	}

	static public void setSessionAttribute(HttpServletRequest req, String key,
			String value) {

		setSessionAttribute(req.getSession(), key, value);
	}

	public static String replaceAttributes(String key, String inJson,
			HttpServletRequest request) {
		String attrJson = (String) request.getSession().getAttribute(key);
		String finalJson = SimpleJson.replaceJsonFields(attrJson, inJson);

		return finalJson;
	}

}
