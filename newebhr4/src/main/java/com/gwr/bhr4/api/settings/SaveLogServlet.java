package com.gwr.api.settings;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.util.JsonProperties;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.StringUtil;

/**
 * This is NON-Json servlet. We do not respond with JSON, just text
 * 
 * NOTES: This required changes to BOTH rest.js and util.js
 * 
 * @author Paul Hsu
 * 
 */
@Controller
@RequestMapping("/api/settings/savelog")
public class SaveLogServlet {

	@RequestMapping(method = RequestMethod.GET)
	public String get(HttpServletRequest request) {
		return "";

	}

	@RequestMapping(method = RequestMethod.POST)
	public String post(HttpServletRequest request) {
		return "";

	}
}
