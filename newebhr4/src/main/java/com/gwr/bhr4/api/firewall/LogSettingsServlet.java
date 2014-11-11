package com.gwr.bhr4.api.firewall;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gwr.bhr4.api.NonListTypeAbstract;
import com.gwr.util.ServletRequestUtilities;

@Controller
@RequestMapping("/api/firewall/log/settings")
public class LogSettingsServlet extends NonListTypeAbstract {
	public LogSettingsServlet() {
		servletName = this.getClass().getSimpleName();
	}
}
