package com.gwr.bhr4.api.dhcp.model;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.gwr.bhr4.dto.JSONDto;
import com.gwr.bhr4.dto.JSONListDto;
import com.gwr.util.json.SimpleJson;

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
			if (mac.equals(thisMac)){
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
		one.put("id", nextId);
		UIBug(one);
		dtoList.addOneByIndex("id", jsondto.getJson());
	}

	private void UIBug(Map one){
		// bug in UI no 'staticAddress' in router, but UI send it.
		// 'staticCheckbox' should be the one send
		if (null != one.get("staticAddress")) {
			one.put("staticCheckbox", one.get("staticAddress"));
			one.remove("staticAddress");
		}
	}
	
	@SuppressWarnings({ "rawtypes" })
	private long getNextIDInList(String idString) {

		// if original array is empty, start with 1
		if (DhcpCLients == null || DhcpCLients.isEmpty())
			return 1;

		long maxIDInList = 0;
		for (Map model : DhcpCLients) {
			Long lid = (Long)model.get(idString);
			if (lid > maxIDInList) {
				maxIDInList = lid;
			}
		}

		return (maxIDInList + 1);
	}

}
