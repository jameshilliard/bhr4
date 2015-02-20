package com.gwr.api.wireless.model;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.api.wireless.WirelessServlet;
import com.gwr.util.json.SimpleJson;

public class Wireless {
	private final static Logger logger = LoggerFactory
			.getLogger(Wireless.class);

	@SuppressWarnings("rawtypes")
	List<Map> maps;

	public Wireless(String jsontext) {
		maps = SimpleJson.getJsonObjects(jsontext);
	}

	public String getJson() {
		return SimpleJson.toJsonText(maps);
	}

	@SuppressWarnings("rawtypes")
	public Map getByIndex(String idx) {
		for (Map p : maps) {
			String id = "" + p.get("id");
			if (idx.equals(id))
				return p;
		}
		return null;
	}

	@SuppressWarnings("rawtypes")
	public String getJsonByIndex(String idx) {

		Map p = getByIndex(idx);
		return SimpleJson.toJsonText(p);
	}

	@SuppressWarnings("rawtypes")
	public Map getSecurity(String idx) {
		Map wireless = this.getByIndex(idx);
		Map sec = (Map) wireless.get("security");
		return sec;
	}

	@SuppressWarnings("rawtypes")
	public Map getWep(String idx) {
		Map security = this.getSecurity(idx);
		Map wep = (Map) security.get("wep");
		return wep;
	}

	@SuppressWarnings("rawtypes")
	public String getWepJson(String idx) {
		Map wep = (Map) getWep(idx);
		return SimpleJson.toJsonText(wep);
	}

	@SuppressWarnings("rawtypes")
	public Map getWpa(String idx) {
		Map security = this.getSecurity(idx);

		Map wpa = (Map) security.get("wpa");

		return wpa;
	}

	@SuppressWarnings("rawtypes")
	public String getWpaJson(String idx) {
		Map wpa = (Map) getWpa(idx);
		return SimpleJson.toJsonText(wpa);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceWep(String idx, Map mapBy) {
		Map thisOne = getWep(idx);
		thisOne.putAll(mapBy);
	}

	@SuppressWarnings({ "rawtypes" })
	public void replaceWep(String idx, String jsonText) {
		Map mapBy = SimpleJson.getJsonObject(jsonText);
		replaceWep(idx, mapBy);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceWpa(String idx, Map mapBy) {
		Map thisOne = getWpa(idx);
		thisOne.putAll(mapBy);

	}

	@SuppressWarnings({ "rawtypes" })
	public void replaceWpa(String idx, String jsonText) {
		Map mapBy = SimpleJson.getJsonObject(jsonText);
		replaceWpa(idx, mapBy);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceByIndex(String idx, String jsonText) {
		Map thisOne = getByIndex(idx);
		Map mapBy = SimpleJson.getJsonObject(jsonText);
		thisOne.putAll(mapBy);
	}

	@SuppressWarnings("rawtypes")
	public Map getByListIndex(String idx) {
		int id = Integer.parseInt(idx);
		if (maps.size() > id)
			return maps.get(id);
		return null;
	}

	@SuppressWarnings("rawtypes")
	public String getJsonByListIndex(String idx) {

		Map p = getByListIndex(idx);
		return SimpleJson.toJsonText(p);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceByListIndex(String idx, String jsonText) {
		Map thisOne = getByListIndex(idx);
		Map mapBy = SimpleJson.getJsonObject(jsonText);
		thisOne.putAll(mapBy);
	}

	public Boolean getWirelessGuestEnable() {
		Map map = maps.get(2);
		if (map != null)
			return (Boolean) map.get("enabled");
		else
			return null;
	}

	public void replaceSecurityTypeWhenWpa0(String idx, String jsonText) {

		if (!idx.equals("0"))
			return;
		Map mapBy = SimpleJson.getJsonObject(jsonText);
		Long type = (Long) mapBy.get("encryptionAlgorithm");
		logger.debug(type.toString());
		if (type == 0) {
			type = new Long(2);
		} else if (type == 1) {
			type = new Long(1);
		}
		Map security = this.getSecurity(idx);
		security.put("type", type);
	}

	public void replaceSecurityTypeWhenWpa1(String idx, String jsonText) {

		if (!idx.equals("1"))
			return;
		Map mapBy = SimpleJson.getJsonObject(jsonText);
		Long type = (Long) mapBy.get("type");
		logger.debug(type.toString());
		if (type == 0) {
			type = new Long(1);
		} else if (type == 1) {
			type = new Long(2);
		}
		Map security = this.getSecurity(idx);
		logger.debug(security.get("type").toString());
		security.put("type", type);
	}

	public void replaceSecurityTypeWhenWep(String idx, String jsonText) {

		if (!idx.equals("0"))
			return;
		logger.debug(idx + " " + jsonText);
		Map security = this.getSecurity(idx);
		security.put("type", new Long(0));
	}

	public void changeGuessOnOffWhenWireless0OnOff() {
		Map map = maps.get(0);
		Map map1 = maps.get(2);
		Boolean b1 = (Boolean) map.get("radioEnabled");
		logger.debug(b1 + "");
		// if(b1 == false)
		map1.put("enabled", b1);
	}

	public Boolean getRadioEnabled(String id) {
		Map map = maps.get(0);
		Boolean b1 = (Boolean) map.get("radioEnabled");
		return b1;
	}
}
