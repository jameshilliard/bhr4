package com.gwr.api.settings.model;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.gwr.util.json.JsonDataModel;
import com.gwr.util.json.SimpleJson;

public class Routes {

	@SuppressWarnings("rawtypes")
	Map userMap;

	public Routes(String jsontext) {
		userMap = SimpleJson.getJsonObject(jsontext);
	}

	public String getJson() {
		return SimpleJson.toJsonText(userMap);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public Map getRouteByIndex(String idx) {
		List<Map> routes = (List<Map>) userMap.get("routes");
		for (Map p : routes) {
			String id = "" + p.get("id");
			if (idx.equals(id))
				return p;
		}
		return null;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void deleteRouteByIndex(String idx) {
		List<Map> routes = (List<Map>) userMap.get("routes");
		List<Map> newRoute = new ArrayList<Map>();
		for (Map p : routes) {
			String id = "" + p.get("id");
			if (!idx.equals(id))
				newRoute.add(p);
		}

		userMap.put("routes", newRoute);
	}

// the version to add element into first available slot
//	@SuppressWarnings({ "rawtypes", "unchecked" })
//	public void addUser(String jsonText) {
//		List<Map> users = (List<Map>) userMap.get("users");
//		// find the next id
//		int nextId = 1;
//		while (true) {
//			boolean found = false;
//			for (Map p : users) {
//				String id = "" + nextId;
//				String thisid = "" + p.get("id");
//				if (thisid.equals(id)) {
//					found = true;
//					break;
//				}
//			}
//			if (found) {
//				nextId++;
//			} else {
//				break;
//			}
//		}
//		Map oneUser = SimpleJson.getJsonObject(jsonText);
//		oneUser.put("id", "" + nextId);
//		users.add(oneUser);
//	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void addRoute(String jsonText) {
		List<Map> routes = (List<Map>) userMap.get("routes");
		// find the next id
		long nextId = getNextIDInList("id", routes);
		
		Map newOne = SimpleJson.getJsonObject(jsonText);
		newOne.put("id", nextId);
		routes.add(newOne);
	}

	@SuppressWarnings({ "rawtypes" })
	private long getNextIDInList(String idString, List<Map> modelList) {

		// if original array is empty, start with 1
		if (modelList == null || modelList.isEmpty())
			return 1;

		long maxIDInList = 0;
		for (Map model : modelList) {
			Long lid = (Long)model.get(idString);
			if (lid > maxIDInList) {
				maxIDInList = lid;
			}
		}

		return (maxIDInList + 1);
	}

	@SuppressWarnings("rawtypes")
	public String getRouteJsonByIndex(String idx) {
		Map one = (Map) getRouteByIndex(idx);
		return SimpleJson.toJsonText(one);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceRoute(String idx, Map mapBy) {
		Map thisOne = getRouteByIndex(idx);
		thisOne.putAll(mapBy);
	}

	@SuppressWarnings("rawtypes")
	public String replaceRoute(String idx, String mapByJson) {
		Map mapBy = SimpleJson.getJsonObject(mapByJson);
		replaceRoute(idx, mapBy);
		return getRouteJsonByIndex(idx);
	}
}
