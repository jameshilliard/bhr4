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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.util.ServletRequestUtilities;

public class SimpleJson {
	private final static Logger logger = LoggerFactory
			.getLogger(SimpleJson.class);

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

	// non thread safe, never use static
	//private static JSONParser parser = new JSONParser();
	
	
	// get one map object from json text
	@SuppressWarnings("rawtypes")
	public static Map getJsonObject(String jsonText) {

		Map map = null;

		try {
			JSONParser parser = new JSONParser();
			map = (Map) parser.parse(jsonText, containerFactory);
		} catch (org.json.simple.parser.ParseException e) {
			logger.error(jsonText);
			logger.error(e.getMessage(), e);
		}
		return map;

	}

	// get List of map from json text array
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static List<Map> getJsonObjects(String jsonText) {

		List<Map> maps = null;

		try {
			JSONParser parser = new JSONParser();
			maps = (List<Map>) parser.parse(jsonText, containerFactory);
		} catch (org.json.simple.parser.ParseException e) {
			logger.error(jsonText);
			logger.error(e.getMessage(), e);
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
	
	public static void main(String arg[]){
		
		String nowJson = "{\"wpaShowKeyInUI\":true,\"type\":1,\"key\":\"\"}";
		String in = "{\"type\":1,\"encryptionAlgorithm\":null,\"key\":\"thinkgreen\"}";
				
		String s = replaceJsonFields(nowJson, in);
		System.out.println(s);
		
		String tests = "[{\"connectionType\":0,\"icon\":1,\"id\":0,\"ipAddress\":\"192.168.1.3\",\"ipv6Address\":\"\",\"leaseExpires\":596,\"mac\":\"00:24:be:6f:fa:1a\",\"name\":\"Erica-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false},{\"connectionType\":4,\"icon\":1,\"id\":1,\"ipAddress\":\"192.168.1.4\",\"ipv6Address\":\"\",\"leaseExpires\":1408,\"mac\":\"24:a2:e1:87:a8:99\",\"name\":\"Peggy-iPhone\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":true},{\"connectionType\":0,\"icon\":1,\"id\":2,\"ipAddress\":\"192.168.1.2\",\"ipv6Address\":\"\",\"leaseExpires\":1386,\"mac\":\"20:1a:06:25:28:cd\",\"name\":\"idea-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false},{\"connectionType\":5,\"icon\":1,\"id\":3,\"ipAddress\":\"192.168.1.5\",\"ipv6Address\":\"\",\"leaseExpires\":1407,\"mac\":\"80:56:f2:84:48:e9\",\"name\":\"Dell-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":true},{\"connectionType\":4,\"icon\":1,\"id\":4,\"ipAddress\":\"192.168.1.6\",\"ipv6Address\":\"\",\"leaseExpires\":1421,\"mac\":\"00:a0:96:69:3f:ad\",\"name\":\"Erica-iPad\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false},{\"connectionType\":0,\"icon\":1,\"id\":5,\"ipAddress\":\"192.168.1.7\",\"ipv6Address\":\"\",\"leaseExpires\":1421,\"mac\":\"54:42:49:cb:77:dd\",\"name\":\"new-host-3\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false},{\"connectionType\":5,\"icon\":1,\"id\":6,\"ipAddress\":\"192.168.1.8\",\"ipv6Address\":\"\",\"leaseExpires\":1430,\"mac\":\"00:19:c5:96:b9:20\",\"name\":\"Home-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":true}]";
		List<Map> maps = getJsonObjects(tests);
		for(Map m : maps){
			dump(m);
		}
	}

}
