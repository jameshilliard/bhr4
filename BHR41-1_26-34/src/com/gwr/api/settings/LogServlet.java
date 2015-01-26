package com.gwr.api.settings;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;

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
import com.gwr.util.ServletRequestUtilities1;
import com.gwr.util.StringUtil;

/**
 * This is NON-Json servlet. We do not respond with JSON, just text
 * 
 * NOTES: This required changes to BOTH rest.js and util.js
 * 
 */
@WebServlet("/api/settings/log/*")
public class LogServlet extends HttpServlet {
	private final static Logger logger = LoggerFactory
			.getLogger(LogServlet.class);
	private static final long serialVersionUID = 1L;
	private static String serviceName = "log";
	private static String idName = "id";

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

		String key = getClass().getSimpleName() + id;
		// Get the PrintWriter object from response to write the required JSON
		// object to the output stream

		String json = (String) request.getSession().getAttribute(key);
		PrintWriter out = response.getWriter();
		SimpleDateFormat sdf = new SimpleDateFormat("MMM  d HH:mm:ss yyyy");
		Date d = new Date();
		//json.replaceAll("dddd", sdf.format(d));
		String newout = org.apache.commons.lang3.StringUtils.replace(json, "dddd", sdf.format(d));
		out.print(newout);
		out.flush();
	}

	/**
	 * 
	 */
	// @Override
	// protected void doPut(HttpServletRequest request,
	// HttpServletResponse response) throws ServletException, IOException {
	//
	// ServletRequestUtilities.handlePutRequest(getClass().getSimpleName(),
	// request, response);
	// }
	//
	// @Override
	// protected void doPost(HttpServletRequest request,
	// HttpServletResponse response) throws ServletException, IOException {
	//
	// ServletRequestUtilities.addToJSONArrayByID(idName, getClass()
	// .getSimpleName(), request, response);
	// }
	//
	@Override
	protected void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);

		if (StringUtils.isEmpty(id))
			return;
		String key = getClass().getSimpleName() + id;
		request.getSession().setAttribute(key, "");
	}
}
