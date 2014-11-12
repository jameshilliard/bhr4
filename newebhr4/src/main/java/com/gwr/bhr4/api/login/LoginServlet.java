package com.gwr.bhr4.api.login;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.api.settings.SystemServlet;
import com.gwr.bhr4.dto.JSONDto;
import com.gwr.bhr4.exception.UnAuthException;
import com.gwr.bhr4.session.SessionLoader;

@Controller
@RequestMapping("/api/login")
public class LoginServlet extends HttpServlet {
	private final static Logger logger = LoggerFactory
			.getLogger(LoginServlet.class);

	private static final String USER_ID = "admin";
	private static final String DEFAULT_PASSWORD = "bhr4password";	
	//private static final String PASSWORD = StringUtil.MD5Hash(DEFAULT_PASSWORD);
	private static final String PASSWORD="43dcfde9eb164b31798b56f54d7a5ccc1ce7226e12230e42a117ba171f5d040a3014d8fa43b1d3c1d0656d115c50660a63734df543cd7d56a0eee0cef20e640a";

	@RequestMapping(method = RequestMethod.GET)
	protected String get(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		HttpSession session = request.getSession(false);

		if (null == session) {
			logger.debug("session is null");
			throw new UnAuthException("0");
		} else {
			logger.debug("Login Get " + session.getId());
			Boolean loginOk = (Boolean) session.getAttribute("loginOk");
			if (loginOk == null){
				loginOk = false;
			}
			Integer loginTry = (Integer) session.getAttribute("loginTry");
			if (loginTry == null)
				loginTry = 0;

			logger.debug(loginOk.toString());
			if (loginOk != null && loginOk) {
				return "";
			} else {
				throw new UnAuthException(""+ loginTry);
			}
		}
	}
	@RequestMapping(method = RequestMethod.POST)
	protected String post(@RequestBody String inStr, HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		JSONDto jsondto = new JSONDto(inStr);
		String password = "";
		Map map = jsondto.getMap();
		password = (String) map.get("password");

		if (password.equals(PASSWORD)) {
			request.getSession().setAttribute("loginOk", new Boolean(true));
			// load up all of the JSON for the various screens at the start
			logger.debug("Login ok " + password + " compare to " + PASSWORD);
			logger.debug("Session is " + request.getSession().getId());
			loadDeafult(request);
			Integer loginTry = (Integer) request.getSession().getAttribute("loginTry");
			if(loginTry != null)
				setPreviousLoginTry(request, loginTry.intValue());
	        return "";
		} else {
			logger.debug("Login failed " + password + " compare to " + PASSWORD);
			request.getSession().setAttribute("loginOk", new Boolean(false));
			Integer loginTry = (Integer) request.getSession().getAttribute("loginTry");
			if (loginTry == null)
				loginTry = 0;
			loginTry +=1;
			request.getSession().setAttribute("loginTry", loginTry);
			logger.debug(loginTry + "" + " times " + request.getSession().getId());
			throw new UnAuthException(""+ loginTry);

		}
	}

	// simulate login try failed after login successfully
	private void setPreviousLoginTry(HttpServletRequest request, int trytime){
		String systemJson = (String)request.getSession().getAttribute(SystemServlet.class.getSimpleName());
		JSONDto dto = new JSONDto(systemJson);
		dto.getMap().put("previousFailedLogins", trytime+"");
		String newJson = dto.getJson();
		request.getSession().setAttribute(SystemServlet.class.getSimpleName(), newJson);

	}

	private void loadDeafult(HttpServletRequest request) {
		Boolean ld = (Boolean) request.getSession().getAttribute("loadDefault");

		if (ld != null) {
			return;
		} else {
			request.getSession().setAttribute("loadDefault", new Boolean(true));
			SessionLoader loader = new SessionLoader(request.getSession());
			loader.loadDefaultRouterJSONInToSession();
		}
	}

}
