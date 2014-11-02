package com.gwr.api.settings;

import java.io.IOException;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.net.ntp.TimeStamp;

import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.json.SimpleJson;

/**
 * 
 * @author jerry skidmore
 * 
 */
@WebServlet("/api/settings/datetime")
public class DateTimeServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

//		String outJson = (String) request.getSession()
//				.getAttribute(getClass().getSimpleName());
//		
//		TimeStamp ts = new TimeStamp(new Date());
//		String newdate = "{\"localTime\":" + ts.getSeconds() + "}";
//		String outJson1 = SimpleJson.replaceJsonFields(outJson, newdate);
//		ServletRequestUtilities.sendJSONResponse(outJson1, response);

		ServletRequestUtilities.handleGetRequest(getClass().getSimpleName(),
				request, response);
	}

	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handlePutRequest(getClass().getSimpleName(),
				request, response);
	}

}
