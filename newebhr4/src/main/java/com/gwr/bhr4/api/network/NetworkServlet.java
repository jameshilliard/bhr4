package com.gwr.bhr4.api.network;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.ListTypeAbstract;

@Controller
@RequestMapping("/api/network/")
public class NetworkServlet extends ListTypeAbstract {

	public NetworkServlet() {
		servletName = this.getClass().getSimpleName();
		idName = "connectionId";
	}

}
