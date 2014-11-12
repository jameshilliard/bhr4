package com.gwr.bhr4.api.dhcp;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.NonListTypeAbstract;

@Controller
@RequestMapping("/api/dhcp")
public class DHCPServlet extends NonListTypeAbstract {
	public DHCPServlet() {
		servletName = this.getClass().getSimpleName();
	}
}
