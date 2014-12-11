package com.gwr.bhr4.api.wireless;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gwr.bhr4.api.OtherTypeAbstract;
import com.gwr.bhr4.api.wireless.model.Wireless;

@Controller
@RequestMapping("/api/wireless")
public class WirelessServlet extends OtherTypeAbstract{

	private final static Logger logger = LoggerFactory
			.getLogger(WirelessServlet.class);
	
	public static String TRAKEY = "wireless.transmission";
	public static String QOSKEY = "wireless.qos";
	public static String MACKEY = "wireless.macfilter";
	public static String WPSKEY = "wireless.wps";

	String servletName = getClass().getSimpleName();

	
	
	@RequestMapping(method = RequestMethod.GET)
	public String getWireless(HttpServletRequest request) {
		String js = (String) request.getSession().getAttribute(servletName);

		return js;

	}
	@RequestMapping(method = RequestMethod.PUT)
	public void updateWireless(@RequestBody String inStr, HttpServletRequest request) {
		String js = (String) request.getSession().getAttribute(servletName);
		Wireless wireless = new Wireless(js);
		wireless.replaceAll(inStr);
		request.getSession().setAttribute(servletName, wireless.getJson());
	}

	
	@RequestMapping(value = "/{id}/transmission", method = RequestMethod.GET)
	public String getTransmission(@PathVariable String id, HttpServletRequest request) {
		return getAttribute(request, TRAKEY + id);
	}
	@RequestMapping(value = "/{id}/transmission", method = RequestMethod.PUT)
	public void updateTransmission(@RequestBody String inStr, @PathVariable String id, HttpServletRequest request) {
		String key = TRAKEY + id;
		this.replaceAttribute(request, key, inStr);
	}

	@RequestMapping(value = "/{id}/qos", method = RequestMethod.GET)
	public String getQos(@PathVariable String id, HttpServletRequest request) {
		return getAttribute(request, QOSKEY + id);

	}
	@RequestMapping(value = "/{id}/qos", method = RequestMethod.PUT)
	public void updateQos(@RequestBody String inStr, @PathVariable String id, HttpServletRequest request) {
		String key = QOSKEY + id;
		this.replaceAttribute(request, key, inStr);

	}
	@RequestMapping(value = "/{id}/wep", method = RequestMethod.GET)
	public String getWep(@PathVariable String id, HttpServletRequest request) {
		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		Wireless wireless = new Wireless(js);
		String json = wireless.getWepJson(id);
		return json;

	}
	@RequestMapping(value = "/{id}/wep", method = RequestMethod.PUT)
	public void updateWep(@RequestBody String inStr, @PathVariable String id, HttpServletRequest request) {
		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		Wireless wireless = new Wireless(js);
		wireless.replaceWep(id, inStr);
	}
	@RequestMapping(value = "/{id}/wpa", method = RequestMethod.GET)
	public String getWpa(@PathVariable String id, HttpServletRequest request) {
		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		Wireless wireless = new Wireless(js);
		String json = wireless.getWpaJson(id);
		return json;

	}
	@RequestMapping(value = "/{id}/wpa", method = RequestMethod.PUT)
	public void updateWpa(@RequestBody String inStr, @PathVariable String id, HttpServletRequest request) {
		String js = (String) request.getSession().getAttribute(
				getClass().getSimpleName());
		Wireless wireless = new Wireless(js);
		wireless.replaceWpa(id, inStr);


	}
	@RequestMapping(value = "/{id}/wps", method = RequestMethod.GET)
	public String getWps(@PathVariable String id, HttpServletRequest request) {

		return getAttribute(request, WPSKEY + id);
	}
	@RequestMapping(value = "/{id}/wps", method = RequestMethod.PUT)
	public void updateWps(@RequestBody String inStr, @PathVariable String id, HttpServletRequest request) {
		String key = WPSKEY + id;
		String finalJson = this.replaceAttribute(request, key, inStr);

	}

	@RequestMapping(value = "/{id}/macfilter", method = RequestMethod.GET)
	public String getMacfilter(@PathVariable String id, HttpServletRequest request) {
		return getAttribute(request, MACKEY + id);
	}
	@RequestMapping(value = "/{id}/macfilter", method = RequestMethod.POST)
	public void addMacfilter(@RequestBody String inStr, @PathVariable String id, HttpServletRequest request) {
	}

	@RequestMapping(value = "/{id}/macfilter", method = RequestMethod.PUT)
	public void updateMacfilter(@RequestBody String inStr, @PathVariable String id, HttpServletRequest request) {
	}
	@RequestMapping(value = "/{id}/macfilter", method = RequestMethod.DELETE)
	public void addMacfilter(@PathVariable String id, HttpServletRequest request) {
	}

}	
