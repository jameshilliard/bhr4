package com.gwr.bhr4.api.firewall;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.ListTypeAbstract;

@Controller
@RequestMapping("/api/settings/accesscontrol/")
public class AccessControlServlet extends ListTypeAbstract {

	public AccessControlServlet() {
		servletName = this.getClass().getSimpleName();
		idName = "id";
	}
}
