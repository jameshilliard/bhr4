package com.gwr.bhr4.api.dhcp.model;

import java.util.Map;

import com.gwr.bhr4.dto.JSONDto;
import com.gwr.bhr4.dto.JSONListDto;

public class DHCPClients {
	@SuppressWarnings("rawtypes")
	JSONListDto dtoList;

	public DHCPClients(String jsontext) {
		dtoList = new JSONListDto(jsontext);
	}

	public String getJson() {
		return dtoList.getJson();
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public boolean replaceDHCPClientByWhat(String mapByJson, String bywhat) {

		JSONDto jsondto = new JSONDto(mapByJson);
		Map mapby = jsondto.getMap();
		String mac = (String) jsondto.getMap().get(bywhat);
		Map theMap = null;
		for (Map p : dtoList.getMapList()) {
			String thisMac = "" + p.get(bywhat);
			if (mac.equals(thisMac)) {
				theMap = p;
				break;
			}
		}
		if (theMap == null)
			return false;
		UIBug(mapby);
		theMap.putAll(mapby);
		return true;

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void addClient(String jsonText) {
		// find the next id
		JSONDto jsondto = new JSONDto(jsonText);
		Map one = jsondto.getMap();
		UIBug(one);
		dtoList.addOneByIndex("id", jsondto.getJson());
	}

	private void UIBug(Map one) {
		// bug in UI no 'staticAddress' in router, but UI send it.
		// 'staticCheckbox' should be the one send
		if (null != one.get("staticAddress")) {
			one.put("staticCheckbox", one.get("staticAddress"));
			one.remove("staticAddress");
		}
	}

}
