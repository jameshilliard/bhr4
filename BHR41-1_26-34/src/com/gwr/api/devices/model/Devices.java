package com.gwr.api.devices.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.api.devices.DevicesServlet;
import com.gwr.util.json.SimpleJson;

public class Devices {

	private final static Logger logger = LoggerFactory
			.getLogger(Devices.class);
	@SuppressWarnings("rawtypes")
	List<Map> maps;

	public Devices(String jsontext) {
		maps = SimpleJson.getJsonObjects(jsontext);
	}
	
	public String getJson(){
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
	
	
	public void removeGuestDevices(){
		List <Map> newMaps = new ArrayList<Map>();
		for(Map<?, ?> map : maps){
			Long type = (Long)map.get("connectionType");
			//System.out.println(type);
			if (type != 6){
				newMaps.add(map);
			}
		}
		
		maps = newMaps;
	}

	public Boolean getDeviceStatus(String ipaddr){
		
		Boolean b = false;
		Map pone = null;
		for (Map p : maps) {
			String ip = (String)p.get("ipAddress");
			if(ip.equals(ipaddr)){
				pone = p;
				break;
			}
		}
		
		if(pone != null){
			b = (Boolean)pone.get("status");
			//logger.debug(b+ "");
			}
		return b;
	}

	public void changeDeviceStatusByWirelessType(Long type, Boolean status){
		
		for (Map p : maps) {
			Long t = (Long)p.get("connectionType");
			if(t.equals(type)){
				p.put("status", status);
			}
		}
		
	}

}
