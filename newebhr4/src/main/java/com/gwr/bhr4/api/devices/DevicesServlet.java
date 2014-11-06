package com.gwr.api.devices;


import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.dto.JSONListDto;

@Controller
@RequestMapping("/api/devices/")
public class DevicesServlet {
	private static String serviceName = "devices";
	private static String idName = "id";
	private String servletName = this.getClass().getSimpleName();

@RequestMapping(method = RequestMethod.GET)
public String getAll(HttpServletRequest request) {
	String all = (String) request.getSession()
			.getAttribute(servletName);

			return "list";

		}
		@RequestMapping(value="{id}", method = RequestMethod.GET)
		public String getOne(@PathVariable String id, HttpServletRequest request) {

			String all = (String) request.getSession()
					.getAttribute(servletName);

			JSONListDto dto = new JSONListDto(all);
			return dto.getJsonTextByIndex(idName, id);

		}
		
		@RequestMapping(value="{id}", method = RequestMethod.PUT)
		public String update(@RequestBody String inStr, @PathVariable String id,
				HttpServletRequest request) {

			String all = (String) request.getSession()
					.getAttribute(servletName);

			JSONListDto dto = new JSONListDto(all);
			dto.replaceFieldsByIndex(idName, id, inStr);
			return inStr;

		}
		
	}
}
