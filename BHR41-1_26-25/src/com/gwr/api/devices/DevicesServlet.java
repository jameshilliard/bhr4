package com.gwr.api.devices;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.api.devices.model.Devices;
import com.gwr.api.wireless.WirelessServlet;
import com.gwr.api.wireless.model.Wireless;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.StringUtil;

@WebServlet("/api/devices/*")
public class DevicesServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private final static Logger logger = LoggerFactory
			.getLogger(DevicesServlet.class);

	private static String serviceName = "devices";
	private static String idName = "id";

	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		//ServletRequestUtilities.handleGetRequestByIndex(serviceName, getClass()
		//		.getSimpleName(), idName, request, response);

		String id = StringUtil.retrieveLastId(request.getRequestURI(),
				serviceName);
		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());

		String returnJs = "";
		if (id == null) {

			Boolean gueston = getWirelessGuestEnable(request);
			logger.debug(gueston.toString());
			if (gueston == true) // include all guest devices too
				returnJs = js;
			else {
				Devices devices = new Devices(js);
				devices.removeGuestDevices();
				returnJs = devices.getJson();
			}

		} else {
			Devices devices = new Devices(js);

			returnJs = devices.getJsonByIndex(id);
		}
		ServletRequestUtilities.sendJSONResponse(returnJs, response);	

	}

	@Override
	protected void doPut(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		ServletRequestUtilities.handlePutRequestByIndex(serviceName, getClass()
				.getSimpleName(), idName, request, response);

	}

	private Boolean getWirelessGuestEnable(HttpServletRequest request) {

		String js = (String) request.getSession().getAttribute(
				WirelessServlet.class.getSimpleName());

		Wireless wireless = new Wireless(js);
		return wireless.getWirelessGuestEnable();
	}
}
