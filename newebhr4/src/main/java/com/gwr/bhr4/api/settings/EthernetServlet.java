package com.gwr.bhr4.api.settings;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.NonListTypeAbstract;

@Controller
@RequestMapping("/api/settings/ethernet")
public class EthernetServlet extends NonListTypeAbstract {
	public EthernetServlet() {
		servletName = this.getClass().getSimpleName();
	}

}

