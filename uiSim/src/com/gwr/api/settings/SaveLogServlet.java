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
@WebServlet("/api/settings/savelog/*")
public class SaveLogServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static String serviceName = "log";
	private static String idName = "id";
	private final static Logger logger = LoggerFactory
			.getLogger(SaveLogServlet.class);

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		response.setContentType("application/json");
		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		logger.debug(request.getRequestURI());

		if (StringUtils.isEmpty(id))
			return;

		//String key = getClass().getSimpleName() + id;

		PrintWriter out = response.getWriter();

		out.print("");
		out.flush();
	}
}
