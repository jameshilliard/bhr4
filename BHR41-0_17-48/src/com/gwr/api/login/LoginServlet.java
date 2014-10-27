package com.gwr.api.login;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.session.SessionLoader;
import com.gwr.util.ServletRequestUtilities;
import com.gwr.util.json.SimpleJson;

/**
 * 
 * @author jerry skidmore
 * 
 */
@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private final static Logger logger = LoggerFactory
			.getLogger(LoginServlet.class);

	private static final String USER_ID = "admin";
	private static final String DEFAULT_PASSWORD = "bhr4password";	
	//private static final String PASSWORD = StringUtil.MD5Hash(DEFAULT_PASSWORD);
	private static final String PASSWORD="43dcfde9eb164b31798b56f54d7a5ccc1ce7226e12230e42a117ba171f5d040a3014d8fa43b1d3c1d0656d115c50660a63734df543cd7d56a0eee0cef20e640a";
	/**
	 * 
	 */
	// TODO need to create a cookie that has a default JSON representation of
	// the system. This way as we make changes to it,
	// it's passed back and forth
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String json = ServletRequestUtilities.getJSONFromPUTRequest(request);
		String password = "";

		if (json != null) {
			Map map = SimpleJson.getJsonObject(json);
			password = (String) map.get("password");
		}

		if (password.equals(PASSWORD)) {
			
			// create a session for this flow
			request.getSession().setAttribute("loginTry", new Integer(0));
			request.getSession().setAttribute("loginOk", new Boolean(true));

			// load up all of the JSON for the various screens at the start
			logger.debug("Login ok " + password + " compare to " + PASSWORD);
			loadDeafult(request);
			ServletRequestUtilities.sendJSONResponse("", response);
		} else {
			logger.debug("Login failed " + password + " compare to " + PASSWORD);
			request.getSession().setAttribute("loginOk", new Boolean(false));
			Integer loginTry = (Integer) request.getSession().getAttribute("loginTry");
			if (loginTry == null)
				loginTry = 0;
			loginTry +=1;
			request.getSession().setAttribute("loginTry", loginTry);

			ServletRequestUtilities.reponse401(response, loginTry);

		}
	}

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		HttpSession session = request.getSession(false);

		if (null == session) {
			logger.debug("session is null");
			ServletRequestUtilities.reponse401(response, 0);
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
				ServletRequestUtilities.sendJSONResponse("", response);
			} else {
				ServletRequestUtilities.reponse401(response, loginTry);
			}
		}
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
