package com.gwr.bhr4.api.settings;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.ListTypeAbstract;
import com.gwr.util.ServletRequestUtilities;

@Controller
@RequestMapping("/api/settings/igmphosts/")
public class IGMPHostsServlet extends ListTypeAbstract {

	public IGMPHostsServlet() {
		servletName = this.getClass().getSimpleName();
		idName = "id";
	}
}
