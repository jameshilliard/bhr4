package com.gwr.api.diagnostics;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.api.devices.DevicesServlet;
import com.gwr.util.JsonProperties;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.json.SimpleJson;

@WebServlet("/api/diagnostics")
public class DiagnosticsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private final static Logger logger = LoggerFactory
			.getLogger(DiagnosticsServlet.class);

    private static String pingCount = "pingCount";
    private static String pingCountSave = "pingCountSave";
    private static String destinationSave = "destinationSave";
    @Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		Long pingCountTemp = (Long)request.getSession().getAttribute(pingCount);
		// ping test call by post before
		if(pingCountTemp != null)
		{
			pingCountTemp++;
			request.getSession().setAttribute(pingCount, pingCountTemp);

			Long pingCountSaveTemp = (Long)request.getSession().getAttribute(pingCountSave);
			String destinationSaveTemp = (String)request.getSession().getAttribute(destinationSave);
			Boolean running;
			if(pingCountTemp.equals(pingCountSaveTemp)){
				//System.out.println(pingCount);
				//replaceFields = "{\"running\":false, \"received\":" + pingCount +  ", \"transmitted\":" + pingCount + ", \"destination:\"" + destinationSave + "}";
				running = new Boolean(false);
				request.getSession().removeAttribute(pingCount);
		        request.getSession().removeAttribute(pingCountSave);
		        request.getSession().removeAttribute(destinationSave);
			}
			else
			{
				running = new Boolean(true);
				//replaceFields = "{\"running\":true, \"received\":" + pingCount +  ", \"transmitted\":" + pingCount + ", \"destination\":" + destinationSave + "}";
			}
			//logger.debug(replaceFields);
			String currentJson = JsonProperties.getDiagnosticsOKJSON();
			//String currentJson = (String)request.getSession().getAttribute(getClass().getSimpleName());
			Map thisOne = SimpleJson.getJsonObject(currentJson);
			thisOne.put("transmitted", pingCountTemp);
			thisOne.put("received", pingCountTemp);
			thisOne.put("destination", destinationSaveTemp);
			thisOne.put("count", pingCountSaveTemp);
			thisOne.put("running", running);
		

	        String finalJson = SimpleJson.toJsonText(thisOne);
			ServletRequestUtilities.sendJSONResponse(finalJson, response);	
			return;
		}
		ServletRequestUtilities.handleGetRequest(getClass().getSimpleName(),
				request, response);
		
	}
	
	// {"destination":"192.168.1.7","count":4}
	// simulate ping 4 times
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		//String outJson = JsonProperties.getDiagnosticsOKJSON();
		String currentJson = (String)request.getSession().getAttribute(getClass().getSimpleName());
		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);

        String finalJson = SimpleJson.replaceJsonFields(currentJson, in);
        
		request.getSession().setAttribute(getClass().getSimpleName(), finalJson);
		
		Map inMap = SimpleJson.getJsonObject(in);
		Long pingCountTemp = (Long) inMap.get("count");
		String destination = (String) inMap.get("destination");
		request.getSession().setAttribute(pingCount, new Long(0));
		request.getSession().setAttribute(pingCountSave, pingCountTemp);
		request.getSession().setAttribute(destinationSave, destination);


	}

	
	@Override
	protected void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
	}
}
