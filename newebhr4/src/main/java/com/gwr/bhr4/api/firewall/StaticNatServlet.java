package com.gwr.bhr4.api.firewall;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.ListTypeAbstract;

@Controller
@RequestMapping("/api/settings/staticnat/")
public class StaticNatServlet extends ListTypeAbstract {

	public StaticNatServlet() {
		servletName = this.getClass().getSimpleName();
		idName = "id";
	}
}
