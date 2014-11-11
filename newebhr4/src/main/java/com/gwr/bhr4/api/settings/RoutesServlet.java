package com.gwr.bhr4.api.settings;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.ListTypeAbstract;

@Controller
@RequestMapping("/api/settings/routes/")
public class RoutesServlet extends ListTypeAbstract{


	public RoutesServlet(){
		servletName = this.getClass().getSimpleName();
		idName = "id";
	}
}