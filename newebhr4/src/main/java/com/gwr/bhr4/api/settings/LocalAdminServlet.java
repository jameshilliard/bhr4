package com.gwr.bhr4.api.settings;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.NonListTypeAbstract;

@Controller
@RequestMapping("/api/settings/localadmin")
public class LocalAdminServlet extends NonListTypeAbstract {
	public LocalAdminServlet() {
		servletName = this.getClass().getSimpleName();
	}

}
