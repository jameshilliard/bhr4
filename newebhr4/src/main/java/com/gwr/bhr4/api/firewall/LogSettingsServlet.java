package com.gwr.bhr4.api.firewall;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.NonListTypeAbstract;

@Controller
@RequestMapping("/api/firewall/log/settings")
public class LogSettingsServlet extends NonListTypeAbstract {
	public LogSettingsServlet() {
		servletName = this.getClass().getSimpleName();
	}
}
