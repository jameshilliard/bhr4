package com.gwr.bhr4.api.firewall;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.NonListTypeAbstract;

@Controller
@RequestMapping("/api/firewall")
public class FirewallServlet extends NonListTypeAbstract {
	public FirewallServlet() {
		servletName = this.getClass().getSimpleName();
	}
}
