package com.gwr.api.settings.model;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.gwr.util.json.JsonDataModel;
import com.gwr.util.json.SimpleJson;

public class Ethernet {

	@SuppressWarnings("rawtypes")
	Map map;

	public Ethernet(String jsontext) {
		map = SimpleJson.getJsonObject(jsontext);
	}

	public String getJson() {
		return SimpleJson.toJsonText(map);
	}

	public void update(String inJson){
		Map inMap  = SimpleJson.getJsonObject(inJson);
		
		Map thisMap = (Map)map.get("wan");
		thisMap.putAll((Map)inMap.get("wan"));
		thisMap = (Map)map.get("lan1");
		thisMap.putAll((Map)inMap.get("lan1"));
		thisMap = (Map)map.get("lan2");
		thisMap.putAll((Map)inMap.get("lan2"));
		thisMap = (Map)map.get("lan3");
		thisMap.putAll((Map)inMap.get("lan3"));
		thisMap = (Map)map.get("lan4");
		thisMap.putAll((Map)inMap.get("lan4"));
		
		
	}
}
