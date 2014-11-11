package com.gwr.bhr4.api.parental;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.ListTypeAbstract;

@Controller
@RequestMapping("/api/parental/")
public class ParentalServlet extends ListTypeAbstract {

	public ParentalServlet() {
		servletName = this.getClass().getSimpleName();
		idName = "id";
	}

}
