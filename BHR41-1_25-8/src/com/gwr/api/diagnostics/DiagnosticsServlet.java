package com.gwr.api.diagnostics;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.gwr.util.JsonProperties;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.json.SimpleJson;

/**
 * 
 * @author jerry skidmore
 * 
 */
@WebServlet("/api/diagnostics")
public class DiagnosticsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		Long pingCount = (Long)request.getSession().getAttribute("pingCount");
		// ping test call by post before
		if(pingCount != null)
		{
			pingCount--;
			if(pingCount == 0){
				//System.out.println(pingCount);
				String outJson = (String)request.getSession().getAttribute(getClass().getSimpleName());
				//String s = "{\"running\":false}";
				Long pingCountSave = (Long)request.getSession().getAttribute("pingCountSave");
				String s = "{\"running\":false,\"transmitted\":" + pingCountSave + "}";
		        String finalJson = SimpleJson.replaceJsonFields(outJson, s);
		        request.getSession().setAttribute(getClass().getSimpleName(), finalJson);
		        request.getSession().removeAttribute("pingCount");
		        request.getSession().removeAttribute("pingCountSave");
			}
			else
				request.getSession().setAttribute("pingCount", pingCount);
		}
		
		ServletRequestUtilities.handleGetRequest(getClass().getSimpleName(),
				request, response);
	}
	
	// {"destination":"192.168.1.7","count":4}
	// simulate ping 4 times
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String outJson = JsonProperties.getDiagnosticsOKJSON();
		String in = ServletRequestUtilities.getJSONFromPUTRequest(request);

        String finalJson = SimpleJson.replaceJsonFields(outJson, in);
        
		request.getSession().setAttribute(getClass().getSimpleName(), finalJson);
		
		Map inMap = SimpleJson.getJsonObject(in);
		Long pingCount = (Long) inMap.get("count");
		request.getSession().setAttribute("pingCount", pingCount);
		request.getSession().setAttribute("pingCountSave", pingCount);


	}

	
	@Override
	protected void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
	}
}
