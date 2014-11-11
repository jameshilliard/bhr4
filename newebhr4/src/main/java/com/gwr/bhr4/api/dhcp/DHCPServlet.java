package com.gwr.bhr4.api.dhcp;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.api.dhcp.model.DHCPClients;
import com.gwr.bhr4.api.NonListTypeAbstract;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.StringUtil;

@Controller
@RequestMapping("/api/dhcp")
public class DHCPServlet extends NonListTypeAbstract {
	public DHCPServlet() {
		servletName = this.getClass().getSimpleName();
	}
}
