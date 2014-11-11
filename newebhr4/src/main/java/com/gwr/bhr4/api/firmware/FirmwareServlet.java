package com.gwr.bhr4.api.firmware;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.NonListTypeAbstract;

@Controller
@RequestMapping("/api/firmware")
public class FirmwareServlet extends NonListTypeAbstract {
	public FirmwareServlet() {
		servletName = this.getClass().getSimpleName();
	}
}
