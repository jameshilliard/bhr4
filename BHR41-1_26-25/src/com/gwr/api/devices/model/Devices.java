package com.gwr.api.devices.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.gwr.util.json.SimpleJson;

public class Devices {

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

}
