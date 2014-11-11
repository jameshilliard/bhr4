package com.gwr.bhr4.api.devices;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.ListTypeAbstract;

@Controller
@RequestMapping("/api/devices/")
public class DevicesServlet extends ListTypeAbstract{


	public DevicesServlet(){
		servletName = this.getClass().getSimpleName();
		idName = "id";
	}
}
