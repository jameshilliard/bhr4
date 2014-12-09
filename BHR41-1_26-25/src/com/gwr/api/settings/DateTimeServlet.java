package com.gwr.api.settings;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.net.ntp.TimeStamp;

import com.gwr.util.NTPClient;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.json.SimpleJson;

@WebServlet("/api/settings/datetime")
public class DateTimeServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String dts = "";
		try {
			dts = String.valueOf(NTPClient.getNTPTime());
		} catch (Exception e) {
		}
		if (StringUtils.isNotEmpty(dts)) {
			String second = dts.substring(0, dts.length() - 3);
			String outJson = (String) request.getSession().getAttribute(
					getClass().getSimpleName());

			String newdate = "{\"localTime\":" + second + "}";
			String outJson1 = SimpleJson.replaceJsonFields(outJson, newdate);
			SimpleDateFormat sdf = new SimpleDateFormat("EEE, MMM dd HH:mm:ss yyyy");
			Date d = new Date();
			String newStatus = "Got time update from server. Last update: " + sdf.format(d);
			String newstatusjson = "{\"status\":\"" + newStatus + "\"}";
			String outJson2 = SimpleJson.replaceJsonFields(outJson1, newstatusjson);
		
			ServletRequestUtilities.sendJSONResponse(outJson2, response);
		} else {
			ServletRequestUtilities.handleGetRequest(
					getClass().getSimpleName(), request, response);
		}
	}

	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handlePutRequest(getClass().getSimpleName(),
				request, response);
	}

}
