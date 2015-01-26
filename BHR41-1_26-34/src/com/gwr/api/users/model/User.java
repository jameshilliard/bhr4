package com.gwr.api.users.model;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.gwr.util.json.JsonDataModel;
import com.gwr.util.json.SimpleJson;

public class User {

	@SuppressWarnings("rawtypes")
	Map userMap;

	public User(String jsontext) {
		userMap = SimpleJson.getJsonObject(jsontext);
	}

	public String getJson() {
		return SimpleJson.toJsonText(userMap);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public Map getUserByIndex(String idx) {
		List<Map> users = (List<Map>) userMap.get("users");
		for (Map p : users) {
			String id = "" + p.get("id");
			if (idx.equals(id))
				return p;
		}
		return null;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void deleteUserByIndex(String idx) {
		List<Map> users = (List<Map>) userMap.get("users");
		List<Map> newUsers = new ArrayList<Map>();
		for (Map p : users) {
			String id = "" + p.get("id");
			if (!idx.equals(id))
				newUsers.add(p);
		}

		userMap.put("users", newUsers);
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
	public void addUser(String jsonText) {
		List<Map> users = (List<Map>) userMap.get("users");
		// find the next id
		long nextId = getNextIDInList("id", users);
		
		Map oneUser = SimpleJson.getJsonObject(jsonText);
		oneUser.put("id", nextId);
		users.add(oneUser);
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
	public String getUserJsonByIndex(String idx) {
		Map one = (Map) getUserByIndex(idx);
		return SimpleJson.toJsonText(one);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceUser(String idx, Map mapBy) {
		Map thisOne = getUserByIndex(idx);
		thisOne.putAll(mapBy);
	}

	@SuppressWarnings("rawtypes")
	public String replaceUser(String idx, String mapByJson) {
		Map mapBy = SimpleJson.getJsonObject(mapByJson);
		replaceUser(idx, mapBy);
		return getUserJsonByIndex(idx);
	}
}
