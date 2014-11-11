package com.gwr.bhr4.api.diagnostics;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.NonListTypeAbstract;

@Controller
@RequestMapping("/api/diagnostics")
public class DiagnosticsServlet extends NonListTypeAbstract {
	public DiagnosticsServlet() {
		servletName = this.getClass().getSimpleName();
	}

}
