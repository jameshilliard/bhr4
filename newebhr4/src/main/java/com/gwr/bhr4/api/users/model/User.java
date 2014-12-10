package com.gwr.bhr4.api.users.model;

import java.util.List;
import java.util.Map;

import com.gwr.bhr4.api.ModelAbstract;
import com.gwr.bhr4.dto.JSONDto;

public class User extends ModelAbstract {

	JSONDto jsonDto;

	public User(String jsontext) {
		jsonDto = new JSONDto(jsontext);
	}

	public String getJson() {
		return jsonDto.getJson();
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void replaceAll(String inJson){
		Map p = this.marshallJson(inJson);
		jsonDto.getMap().putAll(p);
		
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public Map getUserMapByIndex(String idx) {
		List<Map> users = (List<Map>) jsonDto.getMap().get("users");
		for (Map p : users) {
			String id = "" + p.get("id");
			if (idx.equals(id))
				return p;
		}
		return null;
	}

	public String getUserJsonByIndex(String idx) {
		Map p = getUserMapByIndex(idx);
		if (p == null)
			return "";
		return this.unmarshallJson(p);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void addUser(String jsonText) {
		List<Map> users = (List<Map>) jsonDto.getMap().get("users");
		// find the next id
		long nextId = getNextIDInList("id", users);

		Map oneUser = this.marshallJson(jsonText);
		oneUser.put("id", nextId);
		users.add(oneUser);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceUser(String idx, Map mapBy) {
		Map thisOne = getUserMapByIndex(idx);
		thisOne.putAll(mapBy);
	}

	@SuppressWarnings("rawtypes")
	public void replaceUser(String idx, String mapByJson) {
		Map mapBy = this.marshallJson(mapByJson);
		replaceUser(idx, mapBy);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void deleteUserByIndex(String idx) {
		List<Map> users = (List<Map>) jsonDto.getMap().get("users");
		Map toBeDeleted = null;
		for (Map p : users) {
			String id = "" + p.get("id");
			if (idx.equals(id)) {
				toBeDeleted = p;
			}
		}

		users.remove(toBeDeleted);
	}

}
