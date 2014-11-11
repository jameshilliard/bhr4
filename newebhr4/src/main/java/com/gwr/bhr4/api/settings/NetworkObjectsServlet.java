package com.gwr.bhr4.api.settings;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.ListTypeAbstract;

@Controller
@RequestMapping("/api/settings/networkobjects/")
public class NetworkObjectsServlet extends ListTypeAbstract {

	public NetworkObjectsServlet() {
		servletName = this.getClass().getSimpleName();
		idName = "id";
	}
}
