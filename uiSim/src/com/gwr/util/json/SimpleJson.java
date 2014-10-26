package com.gwr.util.json;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONValue;
import org.json.simple.parser.ContainerFactory;
import org.json.simple.parser.JSONParser;

public class SimpleJson {

	private static ContainerFactory containerFactory = new ContainerFactory() {
		@SuppressWarnings("rawtypes")
		public List creatArrayContainer() {
			return new LinkedList();
		}

		@SuppressWarnings("rawtypes")
		public Map createObjectContainer() {
			return new LinkedHashMap();
		}

	};

	private static JSONParser parser = new JSONParser();
	
	
	// get one map object from json text
	@SuppressWarnings("rawtypes")
	public static Map getJsonObject(String jsonText) {

		Map map = null;

		try {
			map = (Map) parser.parse(jsonText, containerFactory);
		} catch (org.json.simple.parser.ParseException e) {
			e.printStackTrace();
		}
		return map;

	}

	// get List of map from json text array
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static List<Map> getJsonObjects(String jsonText) {

		List<Map> maps = null;

		try {
			maps = (List<Map>) parser.parse(jsonText, containerFactory);
		} catch (org.json.simple.parser.ParseException e) {
			e.printStackTrace();
		}

		return maps;

	}

	// convert map to json text
	@SuppressWarnings("rawtypes")
	public static String toJsonText(Map p) {
		return JSONValue.toJSONString(p);
	}

	// convert List of map to json text
	@SuppressWarnings("rawtypes")
	public static String toJsonText(List<Map> ps) {
		return JSONArray.toJSONString(ps);
	}

	// get a json text by a specified element from json text
	@SuppressWarnings("rawtypes")
	public static String getJsonTextByIndex(String idName, String idx,
			String json) {
		List<Map> maps = getJsonObjects(json);
		return getJsonTextByIndex(idName, idx, maps);
	}

	// get a json text by a specified element from json text
	@SuppressWarnings("rawtypes")
	public static String getJsonTextByListIndex(String idx,
			String json) {
		List<Map> maps = getJsonObjects(json);
		return toJsonText(maps.get(Integer.parseInt(idx)));
	}

	// get a json text by a specified element from List of map
	@SuppressWarnings("rawtypes")
	public static String getJsonTextByIndex(String idName, String idx,
			List<Map> maps) {
		Map thisOne = null;
		for (Map p : maps) {
			String id = "" + p.get(idName);
			if (idx.equals(id)) {
				thisOne = p;
				break;
			}
		}
		return toJsonText(thisOne);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static String replaceJsonFields(String thisJson, String byJson) {
		Map thisOne = getJsonObject(thisJson);
		Map mapBy = getJsonObject(byJson);
		thisOne.putAll(mapBy);
		return toJsonText(thisOne);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static List<Map> replaceFieldsByIndex(String idName, String idx,
			String thisJson, String byJson) {

		List<Map> maps = SimpleJson.getJsonObjects(thisJson);
		Map thisOne = null;
		for (Map p : maps) {
			String id = "" + p.get(idName);
			if (idx.equals(id)) {
				thisOne = p;
				break;
			}
		}

		Map mapBy = getJsonObject(byJson);
		// don't update id at all, TODO
		if(thisOne != null){
			mapBy.remove(idName);
			thisOne.putAll(mapBy);
		}
		return maps;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static List<Map> replaceFieldsByListIndex(String idx,
			String thisJson, String byJson) {

		List<Map> maps = SimpleJson.getJsonObjects(thisJson);
		Map thisOne = maps.get(Integer.parseInt(idx));

		Map mapBy = getJsonObject(byJson);
		if(thisOne != null){
			thisOne.putAll(mapBy);
		}
		return maps;
	}

	@SuppressWarnings("rawtypes")
	public static void dump(Map json) {
		Iterator iter = json.entrySet().iterator();
		System.out.println("==iterate result==");
		while (iter.hasNext()) {
			Map.Entry entry = (Map.Entry) iter.next();
			System.out.println(entry.getKey() + "=>" + entry.getValue());
		}

	}

}
